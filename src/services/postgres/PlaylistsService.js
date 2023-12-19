const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
   constructor(collaborationService) {
      this._pool = new Pool();
      this._collaborationsService = collaborationService;
   }

   async addPlaylist({ name, owner }) {
      const id = `playlist-${nanoid(16)}`;

      const query = {
         text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
         values: [id, name, owner],
      };

      const result = await this._pool.query(query);

      if (!result.rows[0].id) {
         throw new InvariantError('Playlist gagal ditambahkan');
      }

      return result.rows[0].id;
   }

   async getPlaylists(owner) {
      const query = {
         text: `SELECT playlists.id, playlists.name, users.username FROM playlists
         LEFT JOIN users ON users.id = playlists.owner
         LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
         WHERE playlists.owner = $1 OR collaborations.user_id = $1
         GROUP BY playlists.id, users.username`,
         values: [owner],
      };

      const result = await this._pool.query(query);
      return result.rows;
   }

   async deletePlaylistById(id) {
      const query = {
         text: 'DELETE FROM playlists WHERE id = $1',
         values: [id],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
         throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
      }

      return result.rows;
   }

   async addSongToPlaylist(playlistId, songId) {
      const id = `playlist-song-${nanoid(16)}`;

      const query = {
         text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
         values: [id, playlistId, songId],
      };

      const result = await this._pool.query(query);

      if (!result.rows[0].id) {
         throw new InvariantError('Lagu gagal ditambahkan ke playlist');
      }

      return result.rows[0].id;
   }

   async getSongsFromPlaylist(playlistId) {
      const query = {
         text: `
         SELECT
            playlists.id AS playlist_id,
            playlists.name AS playlist_name,
            users.username,
            songs.id AS song_id,
            songs.title,
            songs.performer
         FROM
            playlists
         JOIN
            users ON playlists.owner = users.id
         JOIN
            playlist_songs ON playlists.id = playlist_songs.playlist_id
         JOIN
            songs ON playlist_songs.song_id = songs.id
         WHERE
            playlists.id = $1
         `,
         values: [playlistId],
      };

      const result = await this._pool.query(query);
      return result.rows;
   }

   async deleteSongFromPlaylist(playlistId, songId) {
      const query = {
         text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
         values: [playlistId, songId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
         throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
      }

      return result.rows;
   }

   async getPlaylistActivities(userId) {
      const query = {
         text: `
         SELECT
            playlists.id AS playlist_id,
            users.username,
            songs.title,
            playlist_song_activities.action,
            playlist_song_activities.time
         FROM
            playlists
         JOIN
            users ON playlists.owner = users.id
         JOIN
            playlist_song_activities ON playlists.id = playlist_song_activities.playlist_id
         JOIN
            songs ON playlist_song_activities.song_id = songs.id
         WHERE
            playlists.owner = $1
         ORDER BY
            playlist_song_activities.time
         `,
         values: [userId],
      };

      const result = await this._pool.query(query);
      return result.rows;
   }

   async verifyPlaylistOwner(id, owner) {
      const query = {
         text: 'SELECT * FROM playlists WHERE id = $1',
         values: [id],
      };

      const result = await this._pool.query(query);
      if (!result.rowCount) {
         throw new NotFoundError('Playlist tidak ditemukan');
      }

      const playlist = result.rows[0];

      if (playlist.owner !== owner) {
         throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }
   }

   async verifyPlaylistAccess(playlistId, userId) {
      try {
         await this.verifyPlaylistOwner(playlistId, userId);
      } catch (error) {
         if (error instanceof NotFoundError) {
            throw error;
         }

         try {
            await this._collaborationsService.verifyCollaborator(playlistId, userId);
         } catch {
            throw error;
         }
      }
   }

   async verifySongId(songId) {
      const query = {
         text: 'SELECT * FROM songs WHERE id = $1',
         values: [songId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
         throw new NotFoundError('Id lagu tidak ditemukan');
      }
   }

   async verifyPlaylistId(playlistId) {
      const query = {
         text: 'SELECT * FROM playlists WHERE id = $1',
         values: [playlistId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
         throw new NotFoundError('Id playlist tidak ditemukan');
      }
   }
}

module.exports = PlaylistsService;
