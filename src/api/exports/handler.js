class ExportsHandler {
   constructor(producerService, playlistsService, validator) {
      this._producerService = producerService;
      this._playlistsService = playlistsService;
      this._validator = validator;

      this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
   }

   async postExportPlaylistHandler(request, h) {
      this._validator.validateExportPlaylistsPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { playlistId } = request.params;

      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

      const message = {
         playlistId: request.params.playlistId,
         targetEmail: request.payload.targetEmail,
      };

      await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

      const response = h.response({
         status: 'success',
         message: 'Permintaan Anda dalam antrean',
      });
      response.code(201);
      return response;
   }
}

module.exports = ExportsHandler;
