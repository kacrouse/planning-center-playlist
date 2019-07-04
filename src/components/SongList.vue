<template>
  <b-collapse class="card" :open="false">
    <div slot="trigger" slot-scope="props" class="card-header" role="button">
      <p
        class="card-header-title"
      >{{songs.length + ' ' + (songs.length > 1 ? headerSuffixPlural : headerSuffix)}}</p>
      <a class="card-header-icon">
        <b-icon :icon="props.open ? 'chevron-down' : 'chevron-up'"></b-icon>
      </a>
    </div>
    <div class="card-content">
      <ul class="content">
        <li v-for="song in songs" v-bind:key="song.title">{{song.title}}</li>
      </ul>
    </div>
  </b-collapse>
</template>

<script>
export default {
  props: ['headerSuffix', 'headerSuffixPlural', 'songs']
};
</script>

<style scoped>
</style>
