class AlbumsHandler {
   constructor(albumsService, storageService, validator) {
      this._albumsService = albumsService;
      this._storageService = storageService;
      this._validator = validator;

      this.postAlbumHandler = this.postAlbumHandler.bind(this);
      this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
      this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
      this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
      this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);
   }

   async postAlbumHandler(request, h) {
      this._validator.validatePostAlbumsPayload(request.payload);
      const { name, year } = request.payload;

      const albumId = await this._albumsService.addAlbum({ name, year });

      const response = h.response({
         status: 'success',
         message: 'Album berhasil ditambahkan',
         data: {
            albumId,
         },
      });
      response.code(201);
      return response;
   }

   async getAlbumByIdHandler(request) {
      const { id } = request.params;
      const result = await this._albumsService.getAlbumById(id);
      const coverUrl = result[0].album_cover ? `http://${process.env.HOST}:${process.env.PORT}/album/${result[0].album_cover}` : null;

      const album = {
         id: result[0].album_id,
         name: result[0].album_name,
         year: result[0].album_year,
         coverUrl,
         songs:
            result[0].song_id
               ? result.map((song) => ({
                  id: song.song_id,
                  title: song.song_title,
                  performer: song.song_performer,
               }))
               : [],
      };

      return {
         status: 'success',
         data: {
            album,
         },
      };
   }

   async putAlbumByIdHandler(request) {
      this._validator.validatePutAlbumsPayload(request.payload);
      const { id } = request.params;

      await this._albumsService.editAlbumById(id, request.payload);

      return {
         status: 'success',
         message: 'Album berhasil diperbarui',
      };
   }

   async deleteAlbumByIdHandler(request) {
      const { id } = request.params;
      await this._albumsService.deleteAlbumById(id);
      return {
         status: 'success',
         message: 'Album berhasil dihapus',
      };
   }

   async postUploadCoverHandler(request, h) {
      const { cover } = request.payload;
      this._validator.validatePostCoversPayload(cover.hapi.headers);

      const { id } = request.params;
      const filename = await this._storageService.writeFile(cover, cover.hapi);

      await this._albumsService.addAlbumCoverById(id, filename);

      const response = h.response({
         status: 'success',
         message: 'Sampul berhasil diunggah',
      });
      response.code(201);
      return response;
   }
}

module.exports = AlbumsHandler;
