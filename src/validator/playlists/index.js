const { PostPlaylistsPayloadSchema, PostPlaylistsSongsPayloadSchema, deletePlaylistsSongsPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const PlaylistsValidator = {
   validatePostPlaylistsPayload: (payload) => {
      const validationResult = PostPlaylistsPayloadSchema.validate(payload);

      if (validationResult.error) {
         throw new InvariantError(validationResult.error.message);
      }
   },
   validatePostPlaylistsSongsPayload: (payload) => {
      const validationResult = PostPlaylistsSongsPayloadSchema.validate(payload);

      if (validationResult.error) {
         throw new InvariantError(validationResult.error.message);
      }
   },
   validateDeletePlaylistsSongsPayload: (payload) => {
      const validationResult = deletePlaylistsSongsPayloadSchema.validate(payload);

      if (validationResult.error) {
         throw new InvariantError(validationResult.error.message);
      }
   },
};

module.exports = PlaylistsValidator;
