<template>
  <b-modal :active="active" width="75%" @close="$emit('cancel')">
    <form class="box" @submit.prevent="create">
      <div class="flex-container">
        <b-field label="Playlist Name" class="name-input">
          <b-input v-model="playlistName"/>
        </b-field>
        <!-- clicking will call the create method because it is type submit -->
        <button
          type="submit"
          class="button is-primary"
          :disabled="!spotifyToken || !playlistName"
        >Create</button>
      </div>
      <div class="field">
        <b-switch v-model="isPublic">Public</b-switch>
      </div>
    </form>
  </b-modal>
</template>

<script>
import SpotifyWebApi from 'spotify-web-api-node';

export default {
  // todo: fill out additional meta on props
  props: ['active', 'defaultName', 'spotifyToken'],
  data() {
    return {
      playlistName: this.defaultName,
      isPublic: false,
      spotifyUserId: '',
    };
  },
  methods: {
    create(event) {
      // if no user id...
      const getTrackFromUrlRegex = /https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/;
      new SpotifyWebApi({ accessToken: this.spotifyToken })
        .createPlaylist(this.spotifyUserId, this.playlistName, { public: this.isPublic })
        .then(({ body }) => {
          this.$emit('playlist-created', body);
        })
        .catch(error => console.log(error));
    },
  },
  watch: {
    // todo: also making this call in parent, use some sort of cache
    spotifyToken(val) {
      // if error...
      new SpotifyWebApi({ accessToken: val })
        .getMe()
        .then(({ body: { id } }) => (this.spotifyUserId = id))
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
