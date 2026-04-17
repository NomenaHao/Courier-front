<template>
  <Navbar v-if="route.name !== 'Login'" />
  <router-view />
  <Notifications :notifications="notifications" />
</template>

<script setup>
import { useRoute } from 'vue-router'
import Navbar from './views/home/layouts/Navbar.vue'
import Notifications from './components/Notifications.vue'
import { useWebSocket } from './composables/useWebSocket'

const route = useRoute()
const { notifications } = useWebSocket()
</script>
