<template>
  <header class="hero is-primary is-small is-bold">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">{{title}}</h1>
          <h2 v-if="subtitle" class="subtitle">{{subtitle}}</h2>
        </div>
      </div>
    </header>
</template>

<script>
export default {
  props: ['title', 'subtitle']
}
</script>

<style scoped>
.hero.is-small .hero-body {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.title {
  font-size: 1.5rem;
}
</style>
