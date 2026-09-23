import { ref } from "vue";

import { API_BASE_URL } from "@/services/api";

const notifications = ref([]);
const lastNotification = ref(null);

const TOAST_DURATION_MS = 5000;

let ws = null;
let reconnectTimer = null;
let shouldReconnect = true;

const dismissNotification = (id) => {
  notifications.value = notifications.value.filter((n) => n.id !== id);
};

const pushNotification = (data) => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const entry = { ...data, id };
  lastNotification.value = { ...data, _receivedAt: Date.now() };
  notifications.value.unshift(entry);
  if (notifications.value.length > 5) {
    notifications.value.pop();
  }
  setTimeout(() => dismissNotification(id), TOAST_DURATION_MS);
};

const buildWsUrl = () => {
  const token = localStorage.getItem("access");
  if (!token) return null;

  const wsBase = API_BASE_URL.replace(/^http/, "ws").replace(/\/api\/?$/, "");
  return `${wsBase}/ws/notifications?token=${encodeURIComponent(token)}`;
};

const connect = () => {
  shouldReconnect = true;

  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const wsUrl = buildWsUrl();
  if (!wsUrl) return;

  ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    pushNotification(data);
  };

  ws.onopen = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  ws.onerror = () => {
    ws?.close();
  };

  ws.onclose = () => {
    ws = null;
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
  ws?.close();
  ws = null;
};

const clear = () => {
  notifications.value = [];
};

export function useWebSocket() {
  return { notifications, lastNotification, connect, disconnect, clear, dismissNotification };
};
