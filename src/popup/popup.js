import Vue from 'vue';
import App from './App';
import CreateSpotifyPlaylistModal from '../components/CreateSpotifyPlaylistModal';
import SpotifyPlaylistSelect from '../components/SpotifyPlaylistSelect';
import Hero from '../components/Hero';
import SongList from '../components/SongList';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';

Vue.use(Buefy);

global.browser = require('webextension-polyfill');
Vue.prototype.$browser = global.browser;

Vue.component('create-spotify-playlist-modal', CreateSpotifyPlaylistModal);
Vue.component('spotify-playlist-select', SpotifyPlaylistSelect);
Vue.component('hero', Hero);
Vue.component('song-list', SongList);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
});
