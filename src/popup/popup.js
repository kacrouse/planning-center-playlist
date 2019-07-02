import Vue from 'vue';
import App from './App';
import CreateSpotifyPlaylistModal from '../components/CreateSpotifyPlaylistModal';
import SpotifyPlaylistSelect from '../components/SpotifyPlaylistSelect';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';

Vue.use(Buefy);

global.browser = require('webextension-polyfill');
Vue.prototype.$browser = global.browser;

Vue.component('create-spotify-playlist-modal', CreateSpotifyPlaylistModal);
Vue.component('spotify-playlist-select', SpotifyPlaylistSelect);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
});
