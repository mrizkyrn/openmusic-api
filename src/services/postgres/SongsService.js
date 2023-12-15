const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapSongsDBToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
   constructor() {
      this._pool = new Pool();
   }

   async addSong({ title, year, performer, genre, duration, albumId }) {
      const id = `song-${nanoid(16)}`;
      const createdAt = new Date().toISOString();
      const updatedAt = createdAt;

      const query = {
         text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
         values: [id, title, year, performer, genre, duration, albumId, updatedAt],
      };

      const result = await this._pool.query(query);

      if (!result.rows[0].id) {
         throw new InvariantError('Song gagal ditambahkan');
      }

      return result.rows[0].id;
   }

   async getSongs() {
      const result = await this._pool.query('SELECT * FROM songs');
      return result.rows.map(mapSongsDBToModel);
   }

   async getSongById(id) {
      const query = {
         text: 'SELECT * FROM songs WHERE id = $1',
         values: [id],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
         throw new NotFoundError('Song tidak ditemukan');
      }

      return result.rows.map(mapSongsDBToModel)[0];
   }

   async editSongById(id, { title, year, performer, genre, duration, albumId }) {
      const updatedAt = new Date().toISOString();
      const query = {
         text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, albumId = $6, updated_at = $7 WHERE id = $8 RETURNING id',
         values: [title, year, performer, genre, duration, albumId, updatedAt, id],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
         throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
      }
   }

   async deleteSongById(id) {
      const query = {
         text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
         values: [id],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
         throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
      }

      return result.rows[0].id;
   }
}

module.exports = SongsService;
