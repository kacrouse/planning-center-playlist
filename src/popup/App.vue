<template>
  <section class="root">
    <section class="hero is-primary is-small is-bold">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">Planning Center to Spotify</h1>
          <!-- <h2 class="subtitle">Add songs from a service to a Spotify playlist!</h2> -->
        </div>
      </div>
    </section>
    <!-- should probably just be a regular form element -->
    <form @submit.prevent="addToSpotifyPlaylist">
      <b-message
        v-if="targetPlaylistUrl"
        title="Success!"
        type="is-success"
        aria-close-label="Close message"
      >
        View your playlist
        <a :href="targetPlaylistUrl" target="_blank">here.</a>
      </b-message>
      <b-message v-if="!hasPlanningCenterToken" type="is-info">
        <p class="content">This extension must have access to Planning Center to run.</p>
        <b-button @click="launchPlanningCenterAuth" type="is-primary">Login to Planning Center</b-button>
      </b-message>
      <b-message v-if="!hasSpotifyToken" type="is-info">
        <p class="content">This extension must have access to Spotify to run.</p>
        <b-button @click="launchSpotifyAuth" type="is-primary">Login to Spotify</b-button>
      </b-message>

      <create-spotify-playlist-modal
        :active="createModalIsActive"
        :spotifyToken="spotifyToken"
        :defaultName="playlistName"
        @cancel="createModalIsActive = false"
        @playlist-created="playlistCreated"
      ></create-spotify-playlist-modal>

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
        <b-autocomplete
          ref="playlistSelect"
          :data="filteredPlaylists"
          field="name"
          placeholder="Find a playlist"
          class="playlist-selection"
          icon="magnify"
          v-model="playlistSearchString"
          @select="option => selectedPlaylist = option"
          :open-on-focus="true"
          :keep-first="true"
        >
          <template slot="header">
            <a @click="createModalIsActive = true">
              <b-icon icon="playlist-plus"></b-icon>
              <span style="margin: auto 0">Create a new playlist</span>
            </a>
          </template>
          <template slot="empty">No results found</template>
        </b-autocomplete>
        <b-button type="submit" :disabled="!canAdd" class="button is-primary">Add</b-button>
      </div>
      <div class="field">
        <b-radio v-model="existingPlaylistAction" native-value="append">Add to End</b-radio>
        <b-radio v-model="existingPlaylistAction" native-value="prepend">Add to Beginning</b-radio>
      </div>
    </form>
  </section>
</template>

<script>
import { getPlanningCenterToken, getSpotifyToken } from '../services/auth';
import PlanningCenterServicesApi from '../services/PlanningCenterServicesApi';
import SpotifyWebApi from 'spotify-web-api-node';

export default {
  data() {
    return {
      existingPlaylistAction: 'append',
      planningCenterToken: null,
      spotifyToken: null,
      planningCenterPlanId: null,
      playlistName: 'My Playlist',
      planningCenterApi: null,
      songs: [],
      spotifyUserId: null,
      createdPlaylistId: null,
      targetPlaylistUrl: null,
      existingPlaylists: [],
      playlistSearchString: '',
      selectedPlaylist: null,
      createModalIsActive: false,
    };
  },
  computed: {
    hasPlanningCenterToken() {
      return !!this.planningCenterToken;
    },
    hasSpotifyToken() {
      return !!this.spotifyToken;
    },
    songsWithSpotifyUrl() {
      return this.songs.filter(song => song.spotifyUrl);
    },
    songsWithoutSpotifyUrl() {
      return this.songs.filter(song => !song.spotifyUrl);
    },
    canAdd() {
      return this.songsWithSpotifyUrl.length > 0 && this.selectedPlaylist;
    },
    filteredPlaylists() {
      if (!this.playlistSearchString) {
        return this.existingPlaylists;
      }
      return this.existingPlaylists.filter(option => {
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
          position: this.existingPlaylistAction === 'append' ? this.selectedPlaylist.tracks.total : 0,
        })
        .then(result => {
          this.targetPlaylistUrl = this.selectedPlaylist.external_urls.spotify;
        });
    },
    playlistCreated(createdPlaylist) {
      this.createModalIsActive = false;
      this.existingPlaylists.push(createdPlaylist);
      this.$refs.playlistSelect.setSelected(createdPlaylist);
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
        const execResult = /planningcenteronline\.com\/plans\/(\d+)/.exec(tab.url);
        // todo: remove id when done testing
        this.planningCenterPlanId = (execResult && execResult[1]) || 42325334;
      });
    },
    spotifyToken(val) {
      if (!val) {
        return;
      }
      new SpotifyWebApi({ accessToken: val }).getMe().then(({ body: { id } }) => (this.spotifyUserId = id));
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
    spotifyUserId(val) {
      if (!val) {
        return;
      }
      const api = new SpotifyWebApi({ accessToken: this.spotifyToken });

      const getAllPlaylists = (allPlaylists, limit, offset) => {
        return api.getUserPlaylists(this.spotifyUserId, { limit, offset }).then(playlists => {
          if (playlists.body.next) {
            return getAllPlaylists(allPlaylists.concat(playlists.body.items), limit, offset + limit);
          } else {
            return allPlaylists.concat(playlists.body.items);
          }
        });
      };

      getAllPlaylists([], 50, 0).then(allPlaylists => {
        this.existingPlaylists = allPlaylists.filter(playlist => playlist.collaborative || playlist.owner.id === this.spotifyUserId);
      });
    },
  },
};
</script>

<style scoped>
.root {
  width: 450px;
}
.flex-container {
  display: flex;
  align-items: flex-end;
}
.playlist-selection {
  flex-grow: 1;
  margin-right: 5px;
}
.playlist-select-container {
  margin: 20px 0;
}
.playlist-selection >>> .dropdown-menu {
  margin-bottom: 20px;
}
form {
  padding: 20px;
}
</style>
