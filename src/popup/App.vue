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
        <div class="flex-container">
          <b-field class="name-input">
            <b-input/>
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

export default {
  data() {
    return {
      showMoreOptions: false,
      action: 'Append',
      planningCenterToken: '',
      spotifyToken: '',
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
</style>
