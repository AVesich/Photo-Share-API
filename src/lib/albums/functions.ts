import { ObjectId, type Document } from "mongodb";
import { albumCollection, userCollection } from "../db.ts"
import { SuccessResultSchema, type SuccessResult } from "../types.ts";
import { AlbumContentsPayload, AlbumPayload, UpdateAlbumPayload, type AlbumContentsPayloadType, type AlbumPayloadType, type UpdateAlbumPayloadType } from "./types/album.ts";

const searchAlbumsPipeline = (parentAlbumId: string, resultCount: number, resultPage: number): Document[] => {
    let aggregationPipeline = [];
    aggregationPipeline.push({
        $match: {
            parent_album_id: new ObjectId(parentAlbumId)
        }
    });
    aggregationPipeline.push({
        $sort: {
            date_added: -1 
        }
    });
    aggregationPipeline.push({
        $skip: resultCount * resultPage
    });
    aggregationPipeline.push({
        $limit: resultCount
    });
    aggregationPipeline.push({
        $addFields: {
            id: "$_id"
        }
    });
        aggregationPipeline.push({
        $unset: "_id"
    });

    return aggregationPipeline;
}

const getAlbumContents = async (albumId: string, pageSize: number, pageNumber: number): Promise<AlbumContentsPayloadType | null> => {    
    const albumResult = await albumCollection.findOne(
        { _id: new ObjectId(albumId) }
    );
    if (albumResult === null) {
        throw new Error('Album not found');
    }

    let albumContents = await albumCollection.aggregate(searchAlbumsPipeline(albumId, pageSize, pageNumber));
    let albums = await albumContents.map(doc => AlbumPayload.parse(doc)).toArray();
    
    console.log(albumResult.date_added);
    let payload = AlbumContentsPayload.parse({
        id: albumResult._id.toString(),
        item_type: albumResult.item_type,
        name: albumResult.name,
        private: albumResult.private,
        parent_album_id: albumResult.parent_album_id,
        owner_ids: albumResult.owner_ids,
        viewer_ids: albumResult.viewer_ids,
        tags: albumResult.tags,
        contents: albums,
        date_added: albumResult.date_added
    });
    
    return payload;
}

const createAlbum = async (parsedJSON: any): Promise<SuccessResult> => {
    let album: AlbumPayloadType = AlbumPayload.parse(parsedJSON);
    
    let hostResult = await albumCollection.findOne({ _id: new ObjectId(album.parent_album_id) });
    if (hostResult === null) {
        throw new Error('Host album not found');
    }
    
    let albumResult = await albumCollection.insertOne(album);

    return SuccessResultSchema.parse({ success: albumResult.insertedId != null });
}

const updateAlbum = async (albumId: string, parsedJSON: any): Promise<SuccessResult> => {
    let updatedFields: UpdateAlbumPayloadType = UpdateAlbumPayload.parse(parsedJSON);

    let response = await albumCollection.updateOne(
        { _id: new ObjectId(albumId) },
        { $set: updatedFields },
        {} // No options
    );

    return SuccessResultSchema.parse({ success: response.modifiedCount != 0 });
}

const deleteAlbum = async (albumId: string): Promise<SuccessResult> => {
    let userRootAlbumResponse = await userCollection.findOne({ root_album_id: new ObjectId(albumId) });
    if (userRootAlbumResponse) {
        return SuccessResultSchema.parse({ success: false });
    }

    let response = await albumCollection.deleteOne({ _id: new ObjectId(albumId) });
    return SuccessResultSchema.parse({ success: response.deletedCount != 0 });
}

export { getAlbumContents, createAlbum, updateAlbum, deleteAlbum }