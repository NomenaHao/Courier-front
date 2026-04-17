import { onMounted, onUnmounted, ref } from "vue";

import { API_BASE_URL } from "@/services/api";

export function useWebSocket() {
  const ws = ref(null);
  const notifications = ref([]);
  let reconnectTimer = null;
  let shouldReconnect = true;

  const buildWsUrl = () => {
    const token = localStorage.getItem("access");
    if (!token) return null;

    const wsBase = API_BASE_URL.replace(/^http/, "ws").replace(/\/api\/?$/, "");
    return `${wsBase}/ws/notifications/?token=${encodeURIComponent(token)}`;
  };

  const connect = () => {
    if (ws.value && (ws.value.readyState === WebSocket.OPEN || ws.value.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = buildWsUrl();
    if (!wsUrl) return;

    ws.value = new WebSocket(wsUrl);

    ws.value.onmessage = (event) => {
      const data = JSON.parse(event.data);
      notifications.value.unshift(data);
      if (notifications.value.length > 5) {
        notifications.value.pop();
      }
    };

    ws.value.onclose = () => {
      ws.value = null;
      if (!shouldReconnect) return;
      reconnectTimer = setTimeout(connect, 3000);
    };
  };

  const disconnect = () => {
    shouldReconnect = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    ws.value?.close();
  };

  const clear = () => {
    notifications.value = [];
  };

  onMounted(connect);
  onUnmounted(disconnect);

  return { notifications, clear, connect, disconnect };
}