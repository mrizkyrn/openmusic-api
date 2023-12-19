require('dotenv').config();

const hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
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

const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

const init = async () => {
   const albumsService = new AlbumsService();
   const songsService = new SongsService();
   const usersService = new UsersService();
   const authenticationsService = new AuthenticationsService();
   const collaborationsService = new CollaborationsService();
   const playlistsService = new PlaylistsService(collaborationsService);

   const server = hapi.server({
      port: process.env.PORT || 5000,
      host: process.env.HOST || 'localhost',
      routes: {
         cors: {
            origin: ['*'],
         },
      },
   });

   // registrasi plugin eksternal
   await server.register([
      {
         plugin: Jwt,
      },
   ]);

   // mendefinisikan strategy otentikasi jwt
   server.auth.strategy('openmusic_jwt', 'jwt', {
      keys: process.env.ACCESS_TOKEN_KEY,
      verify: {
         aud: false,
         iss: false,
         sub: false,
         maxAgeSec: process.env.ACCESS_TOKEN_AGE,
      },
      validate: (artifacts) => ({
         isValid: true,
         credentials: {
            id: artifacts.decoded.payload.id,
         },
      }),
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
      {
         plugin: authentications,
         options: {
            authenticationsService,
            usersService,
            tokenManager: TokenManager,
            validator: AuthenticationsValidator,
         },
      },
      {
         plugin: playlists,
         options: {
            service: playlistsService,
            validator: PlaylistsValidator,
         },
      },
      {
         plugin: collaborations,
         options: {
            collaborationsService,
            playlistsService,
            validator: CollaborationsValidator,
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
