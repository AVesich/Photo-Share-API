import { ObjectId } from "mongodb";
import { userCollection } from "../db.js";
import { CreateUserDocumentSchema, CreateUserPayloadSchema, UpdateUserSchema, UserInfoSchema, type CreateUserDocument, type CreateUserPayload, type UpdateUser, type UserInfo } from "./types/user.js";
import { hash } from "@node-rs/argon2";
import { SuccessResultSchema, type SuccessResult } from "../types.ts";

const getUserById = async (id: string): Promise<UserInfo | null> => {
    const userDoc = await userCollection.findOne({ _id: new ObjectId(id) }, { projection: { _id: 1, username: 1 } });
    const user = UserInfoSchema.parse({
        _id: userDoc!._id.toString(),
        username: userDoc!.username
    });
    return user;
};

const createUser = async (parsedJSON: any): Promise<UserInfo> => {
    const providedUser: CreateUserPayload = CreateUserPayloadSchema.parse(parsedJSON);
    const passwordHash: string = await hash(providedUser.password);
    const userDocument: CreateUserDocument = CreateUserDocumentSchema.parse({
        username: providedUser.username,
        email: providedUser.email,
        passwordHash: passwordHash
    });

    const insertedDoc = await userCollection.insertOne(userDocument);
    const userDoc = await userCollection.findOne({ _id: new ObjectId(insertedDoc.insertedId) }, { projection: { _id: 1, username: 1 } });
    const createUser = UserInfoSchema.parse({
        _id: userDoc!._id.toString(),
        username: userDoc!.username
    });

    return createUser;
};

const updateUser = async (id: string, parsedJSON: any): Promise<SuccessResult> => {
    const verifiedFields: UpdateUser = UpdateUserSchema.parse(parsedJSON);

    await userCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: verifiedFields },
        {} // No options
    );

    return SuccessResultSchema.parse({ success: true });
};

const deleteUser = async (id: string): Promise<SuccessResult> => {
    await userCollection.deleteOne({ _id: new ObjectId(id) });
    return SuccessResultSchema.parse({ success: true });
};

export { getUserById, createUser, updateUser, deleteUser };