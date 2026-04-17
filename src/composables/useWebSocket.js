import { ref, onMounted, onUnmounted } from 'vue'

export function useWebSocket() {
  const ws = ref(null)
  const notifications = ref([])

  const connect = () => {
    if (ws.value) return
    // Utilise wss:// en prod, ws:// en dev
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    ws.value = new WebSocket(`${protocol}//${window.location.host}/ws/notifications/`)

    ws.value.onmessage = (e) => {
      const data = JSON.parse(e.data)
      notifications.value.unshift(data) // plus récent en haut
      if (notifications.value.length > 5) notifications.value.pop() // limite à 5
    }

    ws.value.onclose = () => setTimeout(connect, 3000) // reconnexion auto
  }

  const disconnect = () => ws.value?.close()
  const clear = () => notifications.value = []

  onMounted(connect)
  onUnmounted(disconnect)

  return { notifications, clear }
}