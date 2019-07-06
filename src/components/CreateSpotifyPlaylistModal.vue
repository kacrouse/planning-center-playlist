<template>
  <b-modal :active="active" width="75%" @close="$emit('cancel')">
    <b-loading :is-full-page="true" :active="isSaving"></b-loading>
    <div class="box">
      <div class="flex-container">
        <b-field label="Playlist Name" class="name-input">
          <b-input v-model="playlistName" ref="nameInput" />
        </b-field>
        <b-button
          native-type="button"
          :disabled="!spotifyToken || !playlistName"
          type="is-primary"
          @click="create"
        >Create</b-button>
      </div>
      <div class="field">
        <b-switch v-model="isPublic">Public</b-switch>
      </div>
    </div>
  </b-modal>
</template>

<script>
import SpotifyWebApi from 'spotify-web-api-node';

export default {
  props: {
    active: Boolean,
    defaultName: {
      type: String,
      default: 'My Playlist',
    },
    spotifyToken: String,
  },
  data() {
    return {
      playlistName: this.defaultName,
      isPublic: false,
      spotifyUserId: '',
      isSaving: false,
    };
  },
  methods: {
    create(event) {
      this.isSaving = true;
      new SpotifyWebApi({ accessToken: this.spotifyToken })
        .createPlaylist(this.spotifyUserId, this.playlistName, { public: this.isPublic })
        .then(({ body }) => {
          this.$emit('playlist-created', body);
        })
        .catch(error => console.log(error))
        .finally(() => (this.isSaving = false));
    },
  },
  watch: {
    // todo: also making this call in parent, use some sort of cache
    spotifyToken(val) {
      // if error...
      new SpotifyWebApi({ accessToken: val })
        .getMe()
        .then(({ body: { id } }) => (this.spotifyUserId = id))
        .catch(({ error: { message = 'Unknown error' }, ...rest }) => {
          console.error(rest);
          this.$emit('error', `Error creating playlist: ${message}`);
        });
    },
    active(val) {
      if (val) {
        // $refs not available until after nextTick
        this.$nextTick(() => {
          this.$refs.nameInput.focus();
        });
      }
    },
  },
};
</script>

<style scoped>
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
::v-deep .modal-content {
  max-height: none;
}
</style>
