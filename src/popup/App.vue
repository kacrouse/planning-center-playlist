<template>
  <section class="root">
    <hero title="Planning Center to Spotify"></hero>

    <main>
      <b-message v-if="targetPlaylistUrl" type="is-success" aria-close-label="Close message">
        Success! View your playlist
        <a :href="targetPlaylistUrl" target="_blank">here.</a>
      </b-message>
      <b-message v-if="!planningCenterToken" type="is-info">
        <p class="content">This extension must have access to Planning Center to run.</p>
        <b-button @click="launchPlanningCenterAuth" type="is-primary">Login to Planning Center</b-button>
      </b-message>
      <b-message v-if="!spotifyToken" type="is-info">
        <p class="content">This extension must have access to Spotify to run.</p>
        <b-button @click="launchSpotifyAuth" type="is-primary">Login to Spotify</b-button>
      </b-message>

      <form @submit.prevent="addToSpotifyPlaylist">
        <b-collapse class="card" :open="false">
          <div slot="trigger" slot-scope="props" class="card-header" role="button">
            <p
              class="card-header-title"
            >{{songsWithSpotifyUrl.length + ' ' + (songsWithSpotifyUrl.length > 1 ? 'songs' : 'song')}} will be included</p>
            <a class="card-header-icon">
              <b-icon :icon="props.open ? 'chevron-down' : 'chevron-up'"></b-icon>
            </a>
          </div>
          <div class="card-content">
            <ul class="content">
              <li v-for="song in songsWithSpotifyUrl" v-bind:key="song.spotifyUrl">{{song.title}}</li>
            </ul>
          </div>
        </b-collapse>
        <b-collapse v-if="songsWithoutSpotifyUrl.length" class="card" :open="false">
          <div slot="trigger" slot-scope="props" class="card-header" role="button">
            <p
              class="card-header-title"
            >{{songsWithoutSpotifyUrl.length + ' ' + (songsWithoutSpotifyUrl.length > 1 ? 'songs are missing links to Spotify' : 'song is missing a link to Spotify')}}</p>
            <a class="card-header-icon">
              <b-icon :icon="props.open ? 'chevron-down' : 'chevron-up'"></b-icon>
            </a>
          </div>
          <div class="card-content">
            <ul class="content">
              <li v-for="song in songsWithoutSpotifyUrl" v-bind:key="song.spotifyUrl">{{song.title}}</li>
            </ul>
          </div>
        </b-collapse>
        <div class="flex-container playlist-select-container">
          <spotify-playlist-select
            class="playlist-select"
            :spotifyToken="spotifyToken"
            :defaultNewPlaylistName="playlistName"
            @playlist-selected="playlist => selectedPlaylist = playlist"
          ></spotify-playlist-select>
          <b-button
            native-type="submit"
            :disabled="songsWithSpotifyUrl.length === 0 || !selectedPlaylist"
            class="button is-primary"
          >Add</b-button>
        </div>
        <div class="field">
          <b-radio v-model="playlistAction" native-value="append">Add to End</b-radio>
          <b-radio v-model="playlistAction" native-value="prepend">Add to Beginning</b-radio>
        </div>
      </form>
    </main>
  </section>
</template>

<script>
import { getPlanningCenterToken, getSpotifyToken } from '../services/auth';
import PlanningCenterServicesApi from '../services/PlanningCenterServicesApi';
import SpotifyWebApi from 'spotify-web-api-node';
import { getPlanIdFromUrl } from '../services/PlanningCenterUtil';

export default {
  data() {
    return {
      playlistAction: 'append',
      planningCenterToken: null,
      spotifyToken: null,
      planningCenterPlanId: null,
      playlistName: 'My Playlist',
      planningCenterApi: null,
      songs: [],
      createdPlaylistId: null,
      targetPlaylistUrl: null,
      selectedPlaylist: null,
    };
  },
  computed: {
    songsWithSpotifyUrl() {
      return this.songs.filter(song => song.spotifyUrl);
    },
    songsWithoutSpotifyUrl() {
      return this.songs.filter(song => !song.spotifyUrl);
    },
  },
  methods: {
    launchPlanningCenterAuth: function(event) {
      getPlanningCenterToken({ interactive: true }).then(token => {
        this.planningCenterToken = token;
      });
    },
    launchSpotifyAuth: function(event) {
      getSpotifyToken({ interactive: true }).then(token => {
        this.spotifyToken = token;
      });
    },
    addToSpotifyPlaylist: function(event) {
      const getTrackFromUrlRegex = /https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/;
      new SpotifyWebApi({ accessToken: this.spotifyToken })
        .addTracksToPlaylist(this.selectedPlaylist.id, this.songsWithSpotifyUrl.map(song => `spotify:track:${getTrackFromUrlRegex.exec(song.spotifyUrl)[1]}`), {
          position: this.playlistAction === 'append' ? this.selectedPlaylist.tracks.total : 0,
        })
        .then(result => {
          this.targetPlaylistUrl = this.selectedPlaylist.external_urls.spotify;
        });
    },
  },
  mounted() {
    getPlanningCenterToken({ interactive: false }).then(token => {
      if (token) {
        this.planningCenterToken = token;
      }
    });
    getSpotifyToken({ interactive: false }).then(token => {
      if (token) {
        this.spotifyToken = token;
      }
    });
  },
  watch: {
    planningCenterToken(val) {
      if (!val) {
        return;
      }
      this.planningCenterApi = new PlanningCenterServicesApi({ authToken: val });

      browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        this.planningCenterPlanId = getPlanIdFromUrl(tab.url);
      });
    },
    planningCenterPlanId(val) {
      if (!val) {
        return;
      }
      let songs;
      this.planningCenterApi
        .find('plan', val)
        .then(plan => {
          this.playlistName = plan.data.title || plan.data.dates || this.playlistName;
          return this.planningCenterApi
            .one('service_type', plan.data.service_type.id)
            .one('plan', val)
            .all('item')
            .get();
        })
        .then(items => {
          const songItems = items.data.filter(item => item.item_type === 'song');
          songs = songItems.map(songItem => ({
            title: songItem.title,
            itemId: songItem.id,
          }));
          return Promise.all(songItems.map(item => this.planningCenterApi.request(`${item.links.self}/attachments`)));
        })
        .then(attachmentsByItem => {
          const spotifyAttachments = attachmentsByItem.reduce((flattened, itemAttachments) => {
            const spotifyAttachment = itemAttachments.data.find(attachment => attachment.pco_type === 'AttachmentSpotify');
            if (spotifyAttachment) {
              songs.find(song => song.itemId === itemAttachments.meta.parent.id).attachmentId = spotifyAttachment.id;
              return flattened.concat(spotifyAttachment);
            }
            return flattened;
          }, []);
          return Promise.all(spotifyAttachments.map(attachment => this.planningCenterApi.request(`${attachment.links.self}/open`, 'POST')));
        })
        .then(openedAttachments => {
          const songsByAttachmentId = songs.reduce((mapped, song) => {
            mapped[song.attachmentId] = song;
            return mapped;
          }, {});
          openedAttachments.forEach(open => {
            songsByAttachmentId[open.data.attachment.id].spotifyUrl = open.data.attachment_url;
          });
          this.songs = songs;
        });
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
</style>
