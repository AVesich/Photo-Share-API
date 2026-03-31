const getUserAlbumsRoute: string = '/user/:userId/albums/:pageNumber/:pageSize';
const getAlbumContentsRoute: string = '/albums/:albumId/:pageNumber/:pageSize';
const createAlbumRoute: string = '/users/:userId/albums';
const updateAlbumRoute: string = '/albums/:albumId';
const deleteAlbumRoute: string = '/albums/:albumId';

export { getUserAlbumsRoute, getAlbumContentsRoute, createAlbumRoute, updateAlbumRoute, deleteAlbumRoute };