const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapSongDBToModel } = require('../../utils');
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
         text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
         values: [id, title, year, performer, genre, duration, albumId, createdAt, updatedAt],
      };

      const result = await this._pool.query(query);

      if (!result.rows[0].id) {
         throw new InvariantError('Song gagal ditambahkan');
      }

      return result.rows[0].id;
   }

   async getSongs({ title, performer }) {
      const values = [];
      let query = 'SELECT id, title, performer FROM songs Where 1 = 1';

      if (title) {
         values.push(`%${title}%`);
         query += ` AND title ILIKE $${values.length}`;
      }

      if (performer) {
         values.push(`%${performer}%`);
         query += ` AND performer ILIKE $${values.length}`;
      }

      const result = await this._pool.query(query, values);
      return result.rows.map(mapSongDBToModel);
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

      return mapSongDBToModel(result.rows[0]);
   }

   async editSongById(id, { title, year, performer, genre, duration, albumId }) {
      const updatedAt = new Date().toISOString();
      const values = [title, year, performer, genre];
      const setClauses = ['title = $1', 'year = $2', 'performer = $3', 'genre = $4'];

      if (duration !== undefined) {
         values.push(duration);
         setClauses.push(`duration = $${values.length}`);
      }

      if (albumId !== undefined) {
         values.push(albumId);
         setClauses.push(`albumId = $${values.length}`);
      }

      values.push(updatedAt, id);

      const query = {
         text: `UPDATE songs SET ${setClauses.join(', ')}, updated_at = $${values.length - 1} WHERE id = $${
            values.length
         } RETURNING id`,
         values,
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
