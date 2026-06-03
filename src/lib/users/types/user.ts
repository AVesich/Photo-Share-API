import * as z from 'zod/mini';

const UserInfoSchema = z.object({
    id: z.string(),
    username: z.string(),
    root_album_id: z.string(),
    profile_picture_data: z.string()
});
type UserInfo = z.output<typeof UserInfoSchema>;

const UnhashedUserPayloadSchema = z.object({
    username: z.string(),
    email: z.email(),
    password: z.string(),
    profile_picture_data: z.string(),
});
type UnhashedUserPayload = z.output<typeof UnhashedUserPayloadSchema>;

const CreateUserPayloadSchema = UnhashedUserPayloadSchema;
type CreateUserPayload = UnhashedUserPayload;

const HashedUserPayloadSchema = z.object({
    username: z.string(),
    email: z.email(),
    password_hash: z.string(),
    root_album_id: z.string(),
});
type HashedUserPayload = z.output<typeof HashedUserPayloadSchema>;

const CreateUserDocumentSchema = HashedUserPayloadSchema;
type CreateUserDocument = HashedUserPayload;

const UpdateUserSchema = z.object({
    username: z.nullable(z.optional(z.string()))
});
type UpdateUser = z.output<typeof UpdateUserSchema>;

export { UserInfoSchema, type UserInfo, UnhashedUserPayloadSchema, type UnhashedUserPayload, CreateUserPayloadSchema, type CreateUserPayload, HashedUserPayloadSchema, type HashedUserPayload, CreateUserDocumentSchema, type CreateUserDocument, UpdateUserSchema, type UpdateUser };