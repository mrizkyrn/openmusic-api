const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
   constructor() {
      this._pool = new Pool();
   }

   async addAlbum({ name, year }) {
      const id = `album-${nanoid(16)}`;
      const createdAt = new Date().toISOString();

      const query = {
         text: 'INSERT INTO albums (id, name, year, created_at, updated_at) VALUES ($1, $2, $3, $4, $4) RETURNING id',
         values: [id, name, year, createdAt],
      };

      const result = await this._pool.query(query);

      if (!result.rows[0].id) {
         throw new InvariantError('Album gagal ditambahkan');
      }

      return result.rows[0].id;
   }

   async getAlbumById(id) {
      const query = {
         text: `
            SELECT
               albums.id AS album_id,
               albums.name AS album_name,
               albums.year AS album_year,
               albums.cover AS album_cover,
               songs.id AS song_id,
               songs.title AS song_title,
               songs.performer AS song_performer
            FROM
               albums
            LEFT JOIN
               songs ON albums.id = songs.album_id
            WHERE
               albums.id = $1;
         `,
         values: [id],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
         throw new NotFoundError('Album tidak ditemukan');
      }

      return result.rows;
   }

   async editAlbumById(id, { name, year }) {
      const updatedAt = new Date().toISOString();
      const query = {
         text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
         values: [name, year, updatedAt, id],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
         throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
      }
   }

   async deleteAlbumById(id) {
      const query = {
         text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
         values: [id],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
         throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
      }

      return result.rows[0].id;
   }

   async verifyAlbumId(id) {
      const query = {
         text: 'SELECT id FROM albums WHERE id = $1',
         values: [id],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
         throw new NotFoundError('Album tidak ditemukan');
      }
   }

   // album covers
   async addAlbumCoverById(id, filename) {
      const updatedAt = new Date().toISOString();
      const query = {
         text: 'UPDATE albums SET cover = $1, updated_at = $2 WHERE id = $3 RETURNING id',
         values: [filename, updatedAt, id],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
         throw new NotFoundError('Gagal memperbarui cover album. Id tidak ditemukan');
      }
   }

   // album likes
   async addLikeAlbumById(id, userId) {
      const idLike = `like-${nanoid(16)}`;

      const query = {
         text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
         values: [idLike, userId, id],
      };

      const result = await this._pool.query(query);

      if (!result.rows[0].id) {
         throw new InvariantError('Gagal menambahkan like album');
      }

      return result.rows[0].id;
   }

   async deleteLikeAlbumById(id, userId) {
      const query = {
         text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
         values: [userId, id],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
         throw new NotFoundError('Like album gagal dihapus. Id tidak ditemukan');
      }

      return result.rows[0].id;
   }

   async getTotalLikeAlbumById(id) {
      const query = {
         text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
         values: [id],
      };

      const result = await this._pool.query(query);

      return result.rows[0].count;
   }

   async verifyUserLikeAlbumById(id, userId) {
      const query = {
         text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
         values: [id, userId],
      };

      const result = await this._pool.query(query);

      if (result.rowCount) {
         throw new InvariantError('User sudah menyukai album ini');
      }
   }
}

module.exports = AlbumsService;
