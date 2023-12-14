class AlbumsHandler {
   constructor(service, validator) {
      this._service = service;
      this._validator = validator;

      this.postAlbumHandler = this.postAlbumHandler.bind(this);
      this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
      this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
      this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
      this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
   }
}

module.exports = AlbumsHandler;
