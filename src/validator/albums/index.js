const { PostAlbumsPayloadSchema, PutAlbumsPayloadSchema } = require('./schema');
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
};

module.exports = AlbumsValidator;
