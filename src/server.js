require('dotenv').config();

const hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
const config = require('./utils/config');
const ClientError = require('./exceptions/ClientError');

// Albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const StorageService = require('./services/storage/StorageService');
const AlbumsValidator = require('./validator/albums');

// Songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// Users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// Playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistSongActivitiesService');
const PlaylistsValidator = require('./validator/playlists');

// Collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// Exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// cache
const CacheService = require('./services/redis/CacheService');

const init = async () => {
   const cacheService = new CacheService();
   const albumsService = new AlbumsService(cacheService);
   const songsService = new SongsService();
   const usersService = new UsersService();
   const authenticationsService = new AuthenticationsService();
   const collaborationsService = new CollaborationsService();
   const playlistsService = new PlaylistsService(collaborationsService);
   const playlistSongActivitiesService = new PlaylistSongActivitiesService();
   const storageService = new StorageService(path.resolve(__dirname, 'api/albums/covers'));

   const server = hapi.server({
      port: config.app.port,
      host: config.app.host,
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
      {
         plugin: Inert,
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
            albumsService,
            storageService,
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
            playlistSongActivitiesService,
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
      {
         plugin: _exports,
         options: {
            producerService: ProducerService,
            playlistsService,
            validator: ExportsValidator,
         },
      },
   ]);

   // error handling
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
