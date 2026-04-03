import { jwtVerify, SignJWT } from "jose";
import { AuthDetailsSchema, AuthResultSchema, RefreshAuthPayloadSchema, type AuthResult, type RefreshAuthPayload } from "./types/auth.js";
import { userCollection } from "../db.js";
import { SuccessResultSchema, type SuccessResult } from "../types.ts";
import { verify } from "@node-rs/argon2";

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
    const userDoc = await userCollection.findOne({
        username: userCredentials.username
    }, { 
        projection: { 
            _id: 1, 
            username: 1, 
            passwordHash: 1 
        } 
    });
    const user = AuthDetailsSchema.parse({
        _id: userDoc!._id.toString(),
        username: userDoc!.username,
        passwordHash: userDoc!.passwordHash
    });

    const passwordCorrect: boolean = await verify(user.passwordHash, userCredentials.password);

    if (passwordCorrect) {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);
        console.log(process.env.JWT_SECRET_KEY);
        const signAlgorithm = 'HS256';
        const jwt = await new SignJWT({
            'urn:photo-share-api:claim:userID': user._id,
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
    } else {
        throw new Error('Invalid username or password');
    }
}

export { validateToken, auth };