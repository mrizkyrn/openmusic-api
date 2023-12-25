const path = require('path');

const routes = (handler) => [
   {
      method: 'POST',
      path: '/albums',
      handler: handler.postAlbumHandler,
   },
   {
      method: 'GET',
      path: '/albums/{id}',
      handler: handler.getAlbumByIdHandler,
   },
   {
      method: 'PUT',
      path: '/albums/{id}',
      handler: handler.putAlbumByIdHandler,
   },
   {
      method: 'DELETE',
      path: '/albums/{id}',
      handler: handler.deleteAlbumByIdHandler,
   },
   // album covers
   {
      method: 'POST',
      path: '/albums/{id}/covers',
      handler: handler.postUploadCoverHandler,
      options: {
         payload: {
            allow: 'multipart/form-data',
            multipart: true,
            output: 'stream',
            maxBytes: 512000,
         },
      },
   },
   {
      method: 'GET',
      path: '/album/{param*}',
      handler: {
         directory: {
            path: path.resolve(__dirname, 'covers'),
         },
      },
   },
   // album likes
   {
      method: 'POST',
      path: '/albums/{id}/likes',
      handler: handler.postLikeAlbumByIdHandler,
      options: {
         auth: 'openmusic_jwt',
      },
   },
   {
      method: 'DELETE',
      path: '/albums/{id}/likes',
      handler: handler.deleteLikeAlbumByIdHandler,
      options: {
         auth: 'openmusic_jwt',
      },
   },
   {
      method: 'GET',
      path: '/albums/{id}/likes',
      handler: handler.getTotalLikeAlbumByIdHandler,
   },
];

module.exports = routes;
