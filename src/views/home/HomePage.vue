<template>
  <main class="home-page" id="top">
    <Hero :is-deliverer="isDeliverer" />
    <Services v-if="!isDeliverer" />
    <Form v-if="!isDeliverer" />
    <Footer :hide-client-links="isDeliverer" />
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Hero from './Hero.vue'
import Services from './Services.vue'
import Footer from './layouts/Footer.vue'
import Form from './Form.vue'

const isDeliverer = ref(false)
onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      isDeliverer.value = user.role === 'livreur'
    } catch {
      isDeliverer.value = false
    }
  }
})
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
