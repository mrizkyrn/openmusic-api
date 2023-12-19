require('dotenv').config();

const hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');

const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

const init = async () => {
   const albumsService = new AlbumsService();
   const songsService = new SongsService();
   const usersService = new UsersService();

   const server = hapi.server({
      port: process.env.PORT || 5000,
      host: process.env.HOST || 'localhost',
      routes: {
         cors: {
            origin: ['*'],
         },
      },
   });

   await server.register([
      {
         plugin: albums,
         options: {
            service: albumsService,
            validator: AlbumsValidator,
         },
      },
      {
         plugin: songs,
         options: {
            service: songsService,
            validator: SongsValidator,
         },
      },
      {
         plugin: users,
         options: {
            service: usersService,
            validator: UsersValidator,
         },
      },
   ]);

   server.ext('onPreResponse', (request, h) => {
      const { response } = request;

      // check if the response is an error
      if (response instanceof Error) {
         // client error handling
         if (response instanceof ClientError) {
            const newResponse = h.response({
               status: 'fail',
               message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
         }

         if (!response.isServer) {
            return h.continue;
         }

         // server error handling
         const newResponse = h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
         });
         newResponse.code(500);
         console.error(response);
         return newResponse;
      }

      return h.continue;
   });

   await server.start();
   console.log(`Server running at: ${server.info.uri}`);
};

init();
