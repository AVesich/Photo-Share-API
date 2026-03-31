import { MongoClient } from "mongodb";

const url = '';

const client = new MongoClient(url);

const database = client.db('photo-share');

const userCollection = database.collection('users');
const albumCollection = database.collection('albums');

export { userCollection, albumCollection };