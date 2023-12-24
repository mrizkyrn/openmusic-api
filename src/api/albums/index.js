const routes = require('./routes');
const AlbumsHandler = require('./handler');

module.exports = {
   name: 'albums',
   version: '1.0.0',
   register: async (server, { albumsService, storageService, validator }) => {
      const albumsHandler = new AlbumsHandler(albumsService, storageService, validator);
      server.route(routes(albumsHandler));
   },
};
