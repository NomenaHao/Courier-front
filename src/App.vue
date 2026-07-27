<template>
  <Navbar v-if="route.name !== 'Login'" />
  <router-view />
  <Notifications :notifications="notifications" :dismiss="dismissNotification" />
</template>

<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './views/home/layouts/Navbar.vue'
import Notifications from './components/Notifications.vue'
import { useWebSocket } from './composables/useWebSocket'

const route = useRoute()
const { notifications, connect, dismissNotification } = useWebSocket()

watch(
  () => route.name,
  (name) => {
    if (name !== 'Login' && localStorage.getItem('access')) {
      connect()
    }
  },
  { immediate: true }
)
</script>
