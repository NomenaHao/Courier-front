<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1055">
    <div v-for="(n, i) in notifications" :key="i" class="toast show mb-2 border-0 shadow" role="alert">
      <div class="toast-header bg-white border-bottom-0">
        <span class="me-2">🔔</span>
        <strong class="me-auto text-dark">{{ n.title }}</strong>
        <button class="btn-close" @click="notifications.splice(i, 1)"></button>
      </div>
      <div class="toast-body">{{ n.body }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({ notifications: Array })
</script>