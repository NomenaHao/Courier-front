<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1055">
    <TransitionGroup name="toast">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="toast show mb-2 border-0 shadow"
        role="alert"
      >
        <div class="toast-header bg-white border-0">
          <span class="me-2">🔔</span>
          <strong class="me-auto text-dark">{{ n.title }}</strong>
          <button type="button" class="btn-close" @click="dismiss(n.id)"></button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
  dismiss: {
    type: Function,
    required: true,
  },
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
