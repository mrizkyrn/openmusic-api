const joi = require('joi');

const PostSongsPayloadSchema = joi.object({
   title: joi.string().required(),
   year: joi.number().interger().required(),
   genre: joi.string().required(),
   performer: joi.string().required(),
   duration: joi.number(),
   albumId: joi.string(),
});

const PutSongsPayloadSchema = joi.object({
   title: joi.string().required(),
   year: joi.number().interger().required(),
   genre: joi.string().required(),
   performer: joi.string().required(),
   duration: joi.number(),
   albumId: joi.string(),
});

module.exports = { PostSongsPayloadSchema, PutSongsPayloadSchema };
