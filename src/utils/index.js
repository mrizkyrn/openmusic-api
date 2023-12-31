/* eslint-disable object-curly-newline */
/* eslint-disable camelcase */

const mapSongDBToModel = ({
   id,
   title,
   year,
   genre,
   performer,
   duration,
   albumId,
   created_at,
   updated_at,
}) => ({
   id,
   title,
   year,
   genre,
   performer,
   duration,
   albumId,
   createdAt: created_at,
   updatedAt: updated_at,
});

module.exports = { mapSongDBToModel };
