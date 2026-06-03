import { MongoClient } from "mongodb";
import * as Minio from 'minio';

// Mongo - user & album data
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const database = client.db('photo-share');

const userCollection = database.collection('users');
const albumCollection = database.collection('albums');

// Minio - data storage
const storageClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'api_username',
    secretKey: 'api_password',
});

const pfpBucket = 'profile-picture-bucket';
const imageBucket = 'image-bucket';
const videoBucket = 'video-bucket';

export { client, userCollection, albumCollection, storageClient, pfpBucket, imageBucket, videoBucket };