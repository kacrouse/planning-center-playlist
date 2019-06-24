<template>
  <section class="root">
    <b-message v-if="!hasPlanningCenterToken" type="is-info">
      <p class="content">This extension must have access to Planning Center to run.</p>
      <b-button @click="launchPlanningCenterAuth" type="is-primary">Login to Planning Center</b-button>
    </b-message>
    <b-message v-if="!hasSpotifyToken" type="is-info">
      <p class="content">This extension must have access to Spotify to run.</p>
      <b-button @click="launchSpotifyAuth" type="is-primary">Login to Spotify</b-button>
    </b-message>
    <b-tabs type="is-toggle" size="is-small" expanded>
      <b-tab-item label="New Playlist">
        <ul class="song-list">
          <li v-for="song in songs" v-bind:key="song.spotifyUrl" class="song-list-item">
            <b-taglist v-if="song.spotifyUrl" attached>
              <b-tag>{{song.title}}</b-tag>
              <b-tag type="is-success">
                <b-icon icon="check" size="is-small"></b-icon>
              </b-tag>
            </b-taglist>
            <b-tooltip
              v-if="!song.spotifyUrl"
              label="No Spotify link to this song found"
              position="is-bottom"
              multilined
            >
              <b-taglist attached>
                <b-tag>{{song.title}}</b-tag>
                <b-tag v-if="!song.spotifyUrl" type="is-danger">
                  <b-icon icon="alert-circle" size="is-small"></b-icon>
                </b-tag>
              </b-taglist>
            </b-tooltip>
          </li>
        </ul>
        <div class="flex-container">
          <b-field class="name-input">
            <b-input v-model="playlistName"/>
          </b-field>
          <b-button
            :disabled="!hasPlanningCenterToken"
            class="button is-primary action-button"
          >Create</b-button>
        </div>
        <a @click="toggleShowMoreOptions" class="is-size-7">More Playlist Options</a>
        <b-collapse :open="showMoreOptions">
          <div class="field">
            <b-switch>Public</b-switch>
          </div>
          <b-field label="Description">
            <b-input type="textarea" size="is-small"/>
          </b-field>
        </b-collapse>
      </b-tab-item>
      <b-tab-item label="Existing Playlist">
        <div class="flex-container bottom-margin">
          <b-autocomplete placeholder="Find a playlist" class="playlist-selection" icon="magnify">
            <template slot="empty">No results found</template>
          </b-autocomplete>
          <b-button
            :disabled="!hasPlanningCenterToken"
            class="button is-primary action-button"
          >{{action}}</b-button>
        </div>
        <div class="field">
          <b-radio v-model="action" native-value="Append">Append</b-radio>
        </div>
        <div class="field">
          <b-radio v-model="action" native-value="Prepend">Prepend</b-radio>
        </div>
        <div class="field">
          <b-radio v-model="action" native-value="Replace">Replace</b-radio>
        </div>
      </b-tab-item>
    </b-tabs>
  </section>
</template>

<script>
import { getPlanningCenterToken, getSpotifyToken } from '../services/auth';
import PlanningCenterServicesApi from '../services/PlanningCenterServicesApi';

export default {
  data() {
    return {
      showMoreOptions: false,
      action: 'Append',
      planningCenterToken: null,
      spotifyToken: null,
      planningCenterPlanId: null,
      playlistName: 'My Playlist',
      planningCenterApi: null,
      songs: [],
    };
  },
  computed: {
    hasPlanningCenterToken() {
      return !!this.planningCenterToken;
    },
    hasSpotifyToken() {
      return !!this.spotifyToken;
    },
  },
  methods: {
    toggleShowMoreOptions: function(event) {
      this.showMoreOptions = !this.showMoreOptions;
    },
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
        const execResult = /https:\/\/services\.planningcenteronline\.com\/plans\/(\d+)/.exec(tab.url);
        this.planningCenterPlanId = execResult && execResult[1];
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
            .one('service_type', plan.meta.parent.id)
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
          console.log(openedAttachments);
          const songsByAttachmentId = songs.reduce((mapped, song) => {
            mapped[song.attachmentId] = song;
            return mapped;
          }, {});
          openedAttachments.forEach(open => {
            console.log(open);
            songsByAttachmentId[open.data.attachment.id].spotifyUrl = open.data.attachment_url;
          });
          this.songs = songs;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.root {
  padding: 20px;
  width: 350px;
}
.flex-container {
  display: flex;
  align-items: flex-start;
}
.name-input,
.playlist-selection {
  flex-grow: 1;
  margin-right: 5px;
}
.bottom-margin {
  margin-bottom: 20px;
}
.song-list-item:not(:last-child) {
  margin-bottom: 5px;
}
.song-list {
  margin-bottom: 10px;
}
</style>
