import * as z from 'zod/mini';

const UserSchema = z.object({
    _id: z.string(),
    username: z.string(),
    email: z.string(),
    passwordHash: z.string(),
    // profilePictureID: z.number()
});
export type User = z.output<typeof UserSchema>;

const CreateUserSchema = z.object({
    username: z.string(),
    email: z.string(),
    passwordHash: z.string()
});
export type CreatedUser = z.output<typeof CreateUserSchema>;

const UpdateUserSchema = z.object({
    username: z.nullable(z.optional(z.string())),
    profilePictureID: z.nullable(z.optional(z.string()))
});
export type UpdateUser = z.output<typeof UpdateUserSchema>;

export { UserSchema, CreateUserSchema, UpdateUserSchema };