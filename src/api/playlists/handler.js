class PlaylistHandler {
   constructor(service, playlistSongActivitiesService, validator) {
      this._service = service;
      this._playlistSongActivitiesService = playlistSongActivitiesService;
      this._validator = validator;

      this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
      this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
      this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
      this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
      this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
      this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
      this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
   }

   async postPlaylistHandler(request, h) {
      this._validator.validatePostPlaylistsPayload(request.payload);
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

      const response = h.response({
         status: 'success',
         message: 'Playlist berhasil ditambahkan',
         data: {
            playlistId,
         },
      });
      response.code(201);
      return response;
   }

   async getPlaylistsHandler(request) {
      const { id: credentialId } = request.auth.credentials;
      const playlists = await this._service.getPlaylists(credentialId);
      return {
         status: 'success',
         data: {
            playlists,
         },
      };
   }

   async deletePlaylistByIdHandler(request) {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      await this._service.deletePlaylistById(playlistId);

      return {
         status: 'success',
         message: 'Playlist berhasil dihapus',
      };
   }

   async postSongToPlaylistHandler(request, h) {
      this._validator.validatePostPlaylistsSongsPayload(request.payload);
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      const { id: playlistId } = request.params;

      await this._service.verifySongId(songId);
      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.addSongToPlaylist(playlistId, songId);
      await this._playlistSongActivitiesService.addPlaylistActivity(playlistId, songId, credentialId, 'add');

      const response = h.response({
         status: 'success',
         message: 'Lagu berhasil ditambahkan ke playlist',
      });
      response.code(201);
      return response;
   }

   async getSongsFromPlaylistHandler(request) {
      const { id: credentialId } = request.auth.credentials;
      const { id: playlistId } = request.params;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);

      const result = await this._service.getSongsFromPlaylist(playlistId);

      return {
         status: 'success',
         data: {
            playlist: {
               id: result[0].playlist_id,
               name: result[0].playlist_name,
               username: result[0].username,
               songs: result.map((item) => ({
                  id: item.song_id,
                  title: item.title,
                  performer: item.performer,
               })),
            },
         },
      };
   }

   async deleteSongFromPlaylistHandler(request) {
      this._validator.validateDeletePlaylistsSongsPayload(request.payload);
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      const { id: playlistId } = request.params;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.deleteSongFromPlaylist(playlistId, songId);
      await this._playlistSongActivitiesService.addPlaylistActivity(playlistId, songId, credentialId, 'delete');

      return {
         status: 'success',
         message: 'Lagu berhasil dihapus dari playlist',
      };
   }

   async getPlaylistActivitiesHandler(request) {
      const { id: credentialId } = request.auth.credentials;
      const { id: playlistId } = request.params;

      await this._service.verifyPlaylistId(playlistId);
      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      const result = await this._service.getPlaylistActivities(credentialId);

      return {
         status: 'success',
         data: {
            playlistId: result[0].playlist_id,
            activities: result.map((item) => ({
               username: item.username,
               title: item.title,
               action: item.action,
               time: item.time,
            })),
         },
      };
   }
}

module.exports = PlaylistHandler;
