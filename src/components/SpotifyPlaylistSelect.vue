<template>
  <div>
    <create-spotify-playlist-modal
      :active="createModalIsActive"
      :spotifyToken="spotifyToken"
      :defaultName="defaultNewPlaylistName"
      @cancel="createModalIsActive = false"
      @playlist-created="playlistCreated"
      @error="error => $emit('error', error)"
    ></create-spotify-playlist-modal>

    <b-autocomplete
      ref="autocomplete"
      :data="filteredPlaylists"
      field="name"
      placeholder="Find a playlist"
      class="playlist-selection"
      icon="magnify"
      v-model="playlistSearchString"
      @select="playlistSelected"
      :open-on-focus="true"
      :keep-first="true"
      v-bind:loading="loadingPlaylists"
    >
      <template slot="header">
        <a @click="createModalIsActive = true" class="new-playlist-link">
          <b-icon icon="playlist-plus"></b-icon>
          <span>Create a new playlist</span>
        </a>
      </template>
      <template slot="empty">No results found</template>
    </b-autocomplete>
  </div>
</template>

<script>
import SpotifyWebApi from 'spotify-web-api-node';

export default {
  props: ['spotifyToken', 'defaultNewPlaylistName'],
  data() {
    return {
      loadingPlaylists: false,
      playlistSearchString: '',
      createModalIsActive: false,
      selectedPlaylist: null,
      playlistOptions: [],
    };
  },
  computed: {
    filteredPlaylists() {
      if (!this.playlistSearchString) {
        return this.playlistOptions;
      }
      return this.playlistOptions.filter(option => {
        return (
          option.name
            .toString()
            .toLowerCase()
            .indexOf(this.playlistSearchString.toLowerCase()) >= 0
        );
      });
    },
  },
  methods: {
    playlistSelected(selectedPlaylist) {
      this.selectedPlaylist = selectedPlaylist;
      this.$emit('playlist-selected', selectedPlaylist);
    },
    playlistCreated(createdPlaylist) {
      this.createModalIsActive = false;
      this.playlistOptions.push(createdPlaylist);
      this.$refs.autocomplete.setSelected(createdPlaylist);
    },
    clearSelected() {
      this.$refs.autocomplete.setSelected({});
    },
  },
  watch: {
    spotifyToken(val) {
      if (!val) {
        return;
      }
      this.loadingPlaylists = true;
      const api = new SpotifyWebApi({ accessToken: this.spotifyToken });

      const getAllPlaylists = (allPlaylists, limit, offset, spotifyUserId) => {
        return api.getUserPlaylists(spotifyUserId, { limit, offset }).then(playlists => {
          if (playlists.body.next) {
            return getAllPlaylists(allPlaylists.concat(playlists.body.items), limit, offset + limit, spotifyUserId);
          } else {
            return allPlaylists.concat(playlists.body.items);
          }
        });
      };

      let spotifyUserId;
      api
        .getMe()
        .then(({ body: { id } }) => {
          spotifyUserId = id;
          return getAllPlaylists([], 50, 0, id);
        })
        .then(allPlaylists => {
          this.playlistOptions = allPlaylists.filter(p => p.collaborative || p.owner.id === spotifyUserId);
        })
        .catch(({ error: { message = 'Unknown error' }, ...rest }) => {
          console.error(rest);
          this.$emit('error', `Error getting playlists: ${message}`);
        })
        .finally(() => (this.loadingPlaylists = false));
    },
  },
};
</script>

<style scoped>
.playlist-selection >>> .dropdown-menu {
  margin-bottom: 20px;
}
.new-playlist-link {
  display: flex;
}
.new-playlist-link span {
  margin-left: 3px;
}
</style>
