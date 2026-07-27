<template>
  <main class="home-page" id="top">
    <Hero />
    <Services />
    <Form />
    <Footer />
  </main>
</template>

<script setup>
import Hero from './Hero.vue'
import Services from './Services.vue'
import Footer from './layouts/Footer.vue'
import Form from './Form.vue'
</script>

<style scoped>
.home-page {
  --ink: #101828;
  --ink-soft: #475467;
  --paper: #f7f4ef;
  --panel: #ffffff;
  --accent: #f95c19;
  --accent-deep: #d9480f;
  --line: #e4e0d8;
  --navy: #0b1324;
  --navy-mid: #152238;

  width: 100%;
  flex: 1;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Outfit', system-ui, sans-serif;
  overflow-x: hidden;
}

.home-page :deep(a) {
  text-decoration: none;
}
</style>
