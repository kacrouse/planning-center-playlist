<template>
  <b-modal :active="active" width="75%" @onCancel="cancelClicked">
    <form class="box">
      <div class="flex-container">
        <b-field label="Playlist Name" class="name-input">
          <b-input v-model="name"/>
        </b-field>
        <button class="button is-primary" @click="createClicked" :disabled="!canCreate">Create</button>
      </div>
      <div class="field">
        <b-switch v-model="isPublic">Public</b-switch>
      </div>
    </form>
  </b-modal>
</template>

<script>
export default {
  props: [
    'active',
    'defaultName',
    'spotifyToken'
  ],
  data() {
    return {
      name: this.defaultName,
      isPublic: false,
    };
  },
  computed: {
    canCreate() {
      return this.spotifyToken && this.name;
    },
  },
  methods: {
    cancelClicked(event) {},
    createClicked(event) {},
    createSpotifyPlaylist: function(event) {
      // if no user id...
      const getTrackFromUrlRegex = /https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/;
      const spotifyApi = new SpotifyWebApi({ accessToken: this.spotifyToken });
      spotifyApi
        .createPlaylist(this.spotifyUserId, this.playlistName, { public: this.playlistIsPublic })
        .then(({ body: { id, external_urls } }) => {
          this.createdPlaylistId = id;
          this.targetPlaylistUrl = external_urls.spotify;
          return spotifyApi.addTracksToPlaylist(id, this.songsWithSpotifyUrl.map(song => `spotify:track:${getTrackFromUrlRegex.exec(song.spotifyUrl)[1]}`));
        })
        .catch(error => console.log(error));
    },
  },
};
</script>

<style>
.flex-container {
  display: flex;
  align-items: flex-end;
  margin-bottom: 15px;
}
.flex-container .field.name-input {
  margin-bottom: 0;
  flex-grow: 1;
  margin-right: 5px;
}
</style>
