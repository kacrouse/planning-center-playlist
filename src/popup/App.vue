<template>
  <section class="root">
    <b-tabs type="is-toggle" size="is-small" expanded>
      <b-tab-item label="New Playlist">
        <div class="flex-container">
          <b-field class="name-input">
            <b-input/>
          </b-field>
          <button class="button is-primary action-button">Create</button>
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
          <b-autocomplete placeholder="Find a playlist" class="playlist-selection">
            <template slot="empty">No results found</template>
          </b-autocomplete>
          <button class="button is-primary action-button">{{action}}</button>
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
export default {
  data() {
    return {
      showMoreOptions: false,
      action: 'Append',
    };
  },
  methods: {
    toggleShowMoreOptions: function(event) {
      this.showMoreOptions = !this.showMoreOptions;
    }
  }
};
</script>

<style lang="scss" scoped>
p {
  font-size: 20px;
}
.root {
  padding: 20px;
  width: 350px;
}
.flex-container {
  display: flex;
  align-items: flex-start;
}
.name-input, .playlist-selection {
  flex-grow: 1;
  margin-right: 5px;
}
.bottom-margin {
  margin-bottom: 20px;
}
</style>
