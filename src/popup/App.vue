<template>
  <section class="root">
    <b-loading :is-full-page="true" :active="isLoading"></b-loading>
    <hero title="Planning Center to Spotify" icon="playlist-music"></hero>

    <main>
      <section>
        <b-message v-if="targetPlaylistUrl" type="is-success" aria-close-label="Close message">
          Success! View your playlist
          <a :href="targetPlaylistUrl" target="_blank">here.</a>
        </b-message>
        <b-message v-if="checkedForPlanningCenterToken && !planningCenterToken" type="is-info">
          <p class="content">This extension must have access to Planning Center to run.</p>
          <b-button @click="launchPlanningCenterAuth" type="is-primary">Login to Planning Center</b-button>
        </b-message>
        <b-message v-if="checkedForSpotifyToken && !spotifyToken" type="is-info">
          <p class="content">This extension must have access to Spotify to run.</p>
          <b-button @click="launchSpotifyAuth" type="is-primary">Login to Spotify</b-button>
        </b-message>
        <b-message
          v-if="checkedForSongs && songs.length === 0"
          type="is-danger"
        >No songs were found in this plan. Add some to create a playlist!</b-message>
        <b-message v-for="error in errors" v-bind:key="error" type="is-danger">{{error}}</b-message>
      </section>

      <section class="song-lists">
        <song-list
          v-if="songsWithSpotifyUrl.length"
          :songs="songsWithSpotifyUrl"
          headerSuffix="song will be included"
          headerSuffixPlural="songs will be included"
        />
        <song-list
          v-if="songsWithoutSpotifyUrl.length"
          :songs="songsWithoutSpotifyUrl"
          headerSuffix="song is missing a link to Spotify"
          headerSuffixPlural="songs are missing links to Spotify"
        />
      </section>

      <form @submit.prevent="addToSpotifyPlaylist">
        <div class="flex-container playlist-select-container">
          <spotify-playlist-select
            ref="playlistSelect"
            class="playlist-select"
            :spotifyToken="spotifyToken"
            :defaultNewPlaylistName="playlistName"
            @playlist-selected="playlist => selectedPlaylist = playlist"
            @error="error => this.errors.push(error)"
          ></spotify-playlist-select>
          <b-button
            native-type="submit"
            :disabled="songsWithSpotifyUrl.length === 0 || !hasSelectedPlaylist"
            class="button is-primary"
          >Add</b-button>
        </div>
        <div class="field">
          <b-radio v-model="playlistAction" native-value="prepend">Add to Beginning</b-radio>
          <b-radio v-model="playlistAction" native-value="append">Add to End</b-radio>
        </div>
      </form>
    </main>
  </section>
</template>

<script>
import Hero from '../components/Hero';
import SongList from '../components/SongList';
import SpotifyPlaylistSelect from '../components/SpotifyPlaylistSelect';
import { getPlanningCenterToken, getSpotifyToken } from '../services/auth';
import SpotifyWebApi from 'spotify-web-api-node';
import { getPlanIdFromUrl } from '../services/PlanningCenterUtil';
import PlanningCenterServicePlan from '../services/PlanningCenterServicePlan';

export default {
  components: {
    Hero,
    SongList,
    SpotifyPlaylistSelect,
  },
  data() {
    return {
      isLoading: true,
      playlistAction: 'prepend',
      checkedForPlanningCenterToken: false,
      planningCenterToken: null,
      checkedForSpotifyToken: false,
      spotifyToken: null,
      planningCenterPlanId: null,
      playlistName: 'My Playlist',
      planningCenterApi: null,
      songs: [],
      checkedForSongs: false,
      createdPlaylistId: null,
      targetPlaylistUrl: null,
      selectedPlaylist: null,
      errors: [],
    };
  },
  computed: {
    songsWithSpotifyUrl() {
      return this.songs.filter(song => song.spotifyUrl);
    },
    songsWithoutSpotifyUrl() {
      return this.songs.filter(song => !song.spotifyUrl);
    },
    hasSelectedPlaylist() {
      return !!(this.selectedPlaylist && this.selectedPlaylist.id);
    },
  },
  methods: {
    launchPlanningCenterAuth: function(event) {
      getPlanningCenterToken({ interactive: true })
        .then(token => {
          this.planningCenterToken = token;
        })
        .catch(error => {
          console.error(error);
          this.errors.add('An error occurred during Planning Center authentication.');
        });
    },
    launchSpotifyAuth: function(event) {
      getSpotifyToken({ interactive: true })
        .then(token => {
          this.spotifyToken = token;
        })
        .catch(({ error_description }) => this.errors.push(error_description));
    },
    addToSpotifyPlaylist: function(event) {
      this.isLoading = true;
      const getTrackFromUrlRegex = /https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/;
      new SpotifyWebApi({ accessToken: this.spotifyToken })
        .addTracksToPlaylist(this.selectedPlaylist.id, this.songsWithSpotifyUrl.map(song => `spotify:track:${getTrackFromUrlRegex.exec(song.spotifyUrl)[1]}`), {
          position: this.playlistAction === 'append' ? this.selectedPlaylist.tracks.total : 0,
        })
        .then(result => {
          this.targetPlaylistUrl = this.selectedPlaylist.external_urls.spotify;
          this.$refs.playlistSelect.clearSelected();
        })
        .catch(({ error: { message = 'Unknown error' }, ...rest }) => {
          console.error(rest);
          this.errors.push(`Error adding to playlist: ${message}`);
        })
        .finally(() => (this.isLoading = false));
    },
  },
  mounted() {
    this.isLoading = true;
    Promise.all([getPlanningCenterToken({ interactive: false }), getSpotifyToken({ interactive: false })])
      .then(([planningCenterToken, spotifyToken]) => {
        if (planningCenterToken) {
          this.planningCenterToken = planningCenterToken;
        }
        this.checkedForPlanningCenterToken = true;

        if (spotifyToken) {
          this.spotifyToken = spotifyToken;
        }
        this.checkedForSpotifyToken = true;
      })
      .finally(() => (this.isLoading = false));
  },
  watch: {
    planningCenterToken(val) {
      if (!val) {
        return;
      }
      browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        this.planningCenterPlanId = getPlanIdFromUrl(tab.url);
      });
    },
    planningCenterPlanId(val) {
      if (!val) {
        return;
      }

      this.isLoading = true;
      const plan = new PlanningCenterServicePlan({
        authToken: this.planningCenterToken,
        planId: this.planningCenterPlanId,
      });
      plan
        .get()
        .then(plan => {
          this.playlistName = plan.data.title || plan.data.dates || this.playlistName;
        })
        .catch(({ errors = [], ...rest }) => {
          console.error({ errors, ...rest });
          this.errors.push(...errors.map(e => `Error getting plan details: ${e.detail}`));
        });
      plan
        .getSongs()
        .then(songs => {
          this.songs = songs;
          this.checkedForSongs = true;
        })
        .catch(({ errors = [], ...rest }) => {
          console.error({ errors, ...rest });
          this.errors.push(...errors.map(e => `Error getting plan songs: ${e.detail}`));
        })
        .finally(() => (this.isLoading = false));
    },
  },
};
</script>

<style scoped>
.root {
  width: 450px;
}
main {
  padding: 20px;
}
.playlist-select {
  flex-grow: 1;
  margin-right: 5px;
}
.playlist-select-container {
  margin: 20px 0;
  display: flex;
  align-items: flex-end;
}
.song-lists {
  margin: 10px 0;
}
</style>
