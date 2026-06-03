import { z } from "zod/mini";

const AlbumPayload = z.object({
    item_type: z.literal(["album", "folder"]),
    name: z.string(),
    private: z.boolean(),
    parent_album_id: z.optional(z.string()),
    owner_ids: z.array(z.string()),
    viewer_ids: z.optional(z.array(z.string())),
    tags: z.optional(z.array(z.string())),
    date_added: z.date(),
});
type AlbumPayloadType = z.output<typeof AlbumPayload>;

const AlbumContentsPayload = z.object({
    id: z.string(),
    item_type: z.literal(["album", "folder"]),
    name: z.string(),
    private: z.boolean(),
    parent_album_id: z.optional(z.string()),
    owner_ids: z.array(z.string()),
    viewer_ids: z.optional(z.array(z.string())),
    tags: z.optional(z.array(z.string())),
    contents: z.array(AlbumPayload),
    date_added: z.optional(z.date()),
});
type AlbumContentsPayloadType = z.output<typeof AlbumContentsPayload>;

const UpdateAlbumPayload = z.object({
    name: z.optional(z.string()),
    private: z.optional(z.boolean()),
    owner_ids: z.optional(z.array(z.string())),
    viewer_ids: z.optional(z.array(z.string())),
    tags: z.optional(z.array(z.string())),
});
type UpdateAlbumPayloadType = z.output<typeof UpdateAlbumPayload>;


export { AlbumPayload, type AlbumPayloadType, AlbumContentsPayload, type AlbumContentsPayloadType, UpdateAlbumPayload, type UpdateAlbumPayloadType };