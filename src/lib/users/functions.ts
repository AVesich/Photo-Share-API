import { ObjectId } from "mongodb";
import { userCollection } from "../db.js";
import { CreateUserSchema, UpdateUserSchema, UserSchema, type CreatedUser, type UpdateUser, type UploadUser, type User } from "./types/user.js";
import z from "zod";

const getUserById = async (id: string): Promise<User | null> => {
    const doc = await userCollection.findOne({ _id: new ObjectId(id) });
    const user = UserSchema.parse(doc);
    return user;
};

const createUser = async (parsedJSON: any): Promise<User> => {
    const providedUser: CreatedUser = CreateUserSchema.parse(parsedJSON);
    const doc = await userCollection.insertOne(providedUser);
    const createUser = UserSchema.parse(doc);
    return createUser;
};

const updateUser = async (id: string, parsedJSON: any) => {
    const verifiedFields: UpdateUser = UpdateUserSchema.parse(parsedJSON);

    await userCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: verifiedFields },
        {} // No options
    );
};

const deleteUser = async (id: string) => {
    await userCollection.deleteOne({ _id: new ObjectId(id) });
};

export { getUserById, createUser, updateUser, deleteUser };