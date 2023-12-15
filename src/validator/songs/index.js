const { PostSongsPayloadSchema, PutSongsPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const SongsValidator = {
   validatePostSongsPayload: (payload) => {
      const validationResult = PostSongsPayloadSchema.validate(payload);

      if (validationResult.error) {
         throw new InvariantError(validationResult.error.message);
      }
   },
   validatePutSongsPayload: (payload) => {
      const validationResult = PutSongsPayloadSchema.validate(payload);

      if (validationResult.error) {
         throw new InvariantError(validationResult.error.message);
      }
   },
};

module.exports = SongsValidator;
