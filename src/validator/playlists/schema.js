const joi = require('joi');

const PostPlaylistsPayloadSchema = joi.object({
   name: joi.string().required(),
});

const PostPlaylistsSongsPayloadSchema = joi.object({
   songId: joi.string().required(),
});

const deletePlaylistsSongsPayloadSchema = joi.object({
   songId: joi.string().required(),
});

module.exports = {
   PostPlaylistsPayloadSchema, PostPlaylistsSongsPayloadSchema, deletePlaylistsSongsPayloadSchema,
};
