const joi = require('joi');

const PostAlbumsPayloadSchema = joi.object({
   name: joi.string().required(),
   year: joi.number().integer().required(),
});

const PutAlbumsPayloadSchema = joi.object({
   name: joi.string().required(),
   year: joi.number().integer().required(),
});

module.exports = { PostAlbumsPayloadSchema, PutAlbumsPayloadSchema };
