import { jwtVerify, SignJWT } from "jose";
import { AuthDetailsSchema, AuthResultSchema, RefreshAuthPayloadSchema, type AuthDetails, type AuthResult, type RefreshAuthPayload } from "./types/auth.js";
import { userCollection } from "../db.js";
import { SuccessResultSchema, type SuccessResult } from "../types.ts";
import { verify } from "@node-rs/argon2";

const INVALID_USER_OR_PASS_TEXT = 'Invalid username or password';

const validateToken = async (jwt: string): Promise<SuccessResult> => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);

    await jwtVerify(jwt, secret, {
        issuer: 'urn:photo-share-api',
        audience: 'urn:photo-share-api',
    });

    // Throws before this if JWT is invalid
    return SuccessResultSchema.parse({
        success: true
    });
}

const auth = async (parsedJSON: any): Promise<AuthResult> => {
    const userCredentials: RefreshAuthPayload = RefreshAuthPayloadSchema.parse(parsedJSON);

    let userDoc;
    try {
        userDoc = await userCollection.findOne({
            username: userCredentials.username
        }, { 
            projection: { 
                _id: 1, 
                username: 1, 
                password_hash: 1 
            } 
        });
    } catch {
        throw new Error(INVALID_USER_OR_PASS_TEXT);
    }
    const user = AuthDetailsSchema.parse({
        _id: userDoc!._id.toString(),
        username: userDoc!.username,
        password_hash: userDoc!.password_hash
    });

    const passwordCorrect: boolean = await verify(user.password_hash, userCredentials.password);

    if (passwordCorrect) {
        return getAuthToken(user._id);
    } else {
        throw new Error(INVALID_USER_OR_PASS_TEXT);
    }
}

const getAuthToken = async (userId: String): Promise<AuthResult> => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);
    const signAlgorithm = 'HS256';
    const jwt = await new SignJWT({
        'urn:photo-share-api:claim:userID': userId,
    })
        .setProtectedHeader({ alg: signAlgorithm })
        .setIssuedAt()
        .setIssuer('urn:photo-share-api')
        .setAudience('urn:photo-share-api')
        .setExpirationTime('24h')
        .sign(secret);
    return AuthResultSchema.parse({
        token: jwt
    });
}

export { validateToken, auth };