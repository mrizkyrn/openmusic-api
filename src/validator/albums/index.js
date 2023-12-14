const { PostAlbumsPayloadSchema, PutAlbumsPayloadSchema } = require('./schema');

const AlbumsValidator = {
   validatePostAlbumsPayload: (payload) => {
      const validationResult = PostAlbumsPayloadSchema.validate(payload);

      if (validationResult.error) {
         throw new Error(validationResult.error.message);
      }
   },
   validatePutAlbumsPayload: (payload) => {
      const validationResult = PutAlbumsPayloadSchema.validate(payload);

      if (validationResult.error) {
         throw new Error(validationResult.error.message);
      }
   },
};

module.exports = AlbumsValidator;
