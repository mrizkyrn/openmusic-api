const { PostAlbumsPayloadSchema, PutAlbumsPayloadSchema, PostCoversPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const AlbumsValidator = {
   validatePostAlbumsPayload: (payload) => {
      const validationResult = PostAlbumsPayloadSchema.validate(payload);

      if (validationResult.error) {
         throw new InvariantError(validationResult.error.message);
      }
   },
   validatePutAlbumsPayload: (payload) => {
      const validationResult = PutAlbumsPayloadSchema.validate(payload);

      if (validationResult.error) {
         throw new InvariantError(validationResult.error.message);
      }
   },
   validatePostCoversPayload: (headers) => {
      const validationResult = PostCoversPayloadSchema.validate(headers);

      if (validationResult.error) {
         throw new InvariantError(validationResult.error.message);
      }
   },
};

module.exports = AlbumsValidator;
