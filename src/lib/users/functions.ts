import { ObjectId } from "mongodb";
import { albumCollection, pfpBucket, storageClient, userCollection } from "../db.js";
import { CreateUserDocumentSchema, CreateUserPayloadSchema, UpdateUserSchema, UserInfoSchema, type CreateUserDocument, type CreateUserPayload, type UpdateUser, type UserInfo } from "./types/user.js";
import { hash } from "@node-rs/argon2";
import { DataResultSchema, SuccessResultSchema, type DataResult, type SuccessResult } from "../types.ts";
import { AlbumPayload, type AlbumPayloadType } from "../albums/types/album.ts";

const getUserByUsername = async (username: string): Promise<UserInfo | null> => {
    const userDoc = await userCollection.findOne({ username: username }, { projection: { _id: 1, username: 1, root_album_id: 1, profile_picture_data: 1  } });
    const pfpData = (await getUserProfilePictureData(username))?.data ?? "";

    return UserInfoSchema.parse({
        id: userDoc!._id.toString(),
        username: userDoc!.username,
        root_album_id: userDoc!.root_album_id,
        profile_picture_data: pfpData,
    });
};

const getUserProfilePictureData = async (username: string): Promise<DataResult | null> => {
    // Check if object exists
    try {
        await storageClient.statObject(pfpBucket, `${username}-profile-photo.png`);
    } catch {
        return null;
    }

    let profilePictureStream = await storageClient.getObject(pfpBucket, `${username}-profile-photo.png`);

    let pictureData = await new Promise((resolve, reject) => {
            let profilePictureData = "";

            profilePictureStream.on('data', function (chunk) {
                profilePictureData += chunk;
            });
            profilePictureStream.on('end', function () {
                resolve(profilePictureData);
            });
            profilePictureStream.on('error', reject);
        }
    );

    return DataResultSchema.parse({
        data: pictureData
    });
}

const createUser = async (parsedJSON: any): Promise<UserInfo> => {
    const albumId = new ObjectId();
    const providedUser: CreateUserPayload = CreateUserPayloadSchema.parse(parsedJSON);
    const passwordHash: string = await hash(providedUser.password);
    const userDocument: CreateUserDocument = CreateUserDocumentSchema.parse({
        username: providedUser.username,
        email: providedUser.email,
        password_hash: passwordHash,
        root_album_id: albumId.toString(),
    });
    const insertedUser = await userCollection.insertOne(userDocument);

    await storageClient.putObject(pfpBucket, `${providedUser.username}-profile-photo.png`, providedUser.profile_picture_data);

    const albumDocument: AlbumPayloadType = AlbumPayload.parse({
        item_type: "folder",
        name: `${providedUser.username}-root`,
        private: true,
        owner_ids: [insertedUser.insertedId.toString()],
        date_added: new Date(),
    });
    const insertedAlbum = await albumCollection.insertOne({ _id: albumId, ...albumDocument });

    return UserInfoSchema.parse({
        id: insertedUser.insertedId.toString(),
        username: providedUser.username,
        root_album_id: insertedAlbum.insertedId.toString(),
        profile_picture_data: providedUser.profile_picture_data
    });
};

const updateUser = async (username: string, parsedJSON: any): Promise<SuccessResult> => {
    const verifiedFields: UpdateUser = UpdateUserSchema.parse(parsedJSON);

    const response = await userCollection.updateOne(
        { username: username },
        { $set: verifiedFields },
        {} // No options
    );

    return SuccessResultSchema.parse({ success: response.modifiedCount != 0 });
};

const deleteUser = async (username: string): Promise<SuccessResult> => {
    let response = await userCollection.deleteOne({ username: username });
    return SuccessResultSchema.parse({ success: response.deletedCount != 0 });
};

const getCanUseUsername = async (username: string): Promise<SuccessResult> => {
    const userDoc = await userCollection.findOne({ username: username }, { projection: { _id: 1 } });
    const taken = userDoc != null ? true : false;
    return SuccessResultSchema.parse({ success: !taken });
}

export { getUserByUsername, getUserProfilePictureData, createUser, updateUser, deleteUser, getCanUseUsername };