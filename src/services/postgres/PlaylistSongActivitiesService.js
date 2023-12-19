const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongActivitiesService {
   constructor() {
      this._pool = new Pool();
   }

   async addPlaylistActivity(playlistId, songId, userId, action) {
      const id = `playlist-activity-${nanoid(16)}`;
      const time = new Date().toISOString();

      const query = {
         text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
         values: [id, playlistId, songId, userId, action, time],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
         throw new InvariantError('Playlist activity gagal ditambahkan');
      }

      return result.rows[0].id;
   }
}

module.exports = PlaylistSongActivitiesService;
