<template>
  <header class="hero is-primary is-small">
    <div class="hero-body">
      <div class="container">
        <h1 class="title is-flex">
          <b-icon :icon="icon" size="is-medium" />
          <span class="title-text">{{title}}</span>
        </h1>
        <h2 v-if="subtitle" class="subtitle">{{subtitle}}</h2>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: String,
    icon: {
      type: String,
      required: true
    },
  },
};
</script>

<style scoped>
.hero.is-small .hero-body {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.title {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
}
.title .title-text {
  margin-left: 10px;
}
</style>
