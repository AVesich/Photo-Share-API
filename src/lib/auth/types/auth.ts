import * as z from 'zod/mini';
import { HashedUserPayloadSchema, UnhashedUserPayloadSchema, type HashedUserPayload, type UnhashedUserPayload } from '../../users/types/user.ts';

const RefreshAuthPayloadSchema = z.object({
    username: z.string(),
    password: z.string()
});
type RefreshAuthPayload = z.output<typeof RefreshAuthPayloadSchema>;

const AuthDetailsSchema = z.object({
    _id: z.string(),
    username: z.string(),
    passwordHash: z.string()
});
type AuthDetails = z.output<typeof AuthDetailsSchema>;

const AuthResultSchema = z.object({
    token: z.string()
});
type AuthResult = z.output<typeof AuthResultSchema>;


export { RefreshAuthPayloadSchema, type RefreshAuthPayload, AuthDetailsSchema, type AuthDetails, AuthResultSchema, type AuthResult };