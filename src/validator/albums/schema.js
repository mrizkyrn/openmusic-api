const Joi = require('joi');

const PostAlbumsPayloadSchema = Joi.object({
   name: Joi.string().required(),
   year: Joi.number().integer().required(),
});

const PutAlbumsPayloadSchema = Joi.object({
   name: Joi.string().required(),
   year: Joi.number().integer().required(),
});

const PostCoversPayloadSchema = Joi.object({
   'content-type': Joi.string()
      .valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
      .required(),
}).unknown();

module.exports = { PostAlbumsPayloadSchema, PutAlbumsPayloadSchema, PostCoversPayloadSchema };
