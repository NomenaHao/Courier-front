<template>
  <div class="page">
    <div class="page-inner">
      <header class="page-head">
        <p class="eyebrow">Livreur</p>
        <h1 class="title">Mes livraisons</h1>
        <p class="lead">Gérez vos missions assignées en temps réel</p>
      </header>

      <div v-if="error" class="feedback error">
        {{ error }}
        <button type="button" class="dismiss" @click="error = ''">Fermer</button>
      </div>

      <div v-if="loading" class="state">Chargement…</div>

      <div v-else-if="deliveries.length === 0" class="state">
        Aucune livraison assignée pour le moment.
      </div>

      <div v-else class="list">
        <article v-for="delivery in deliveries" :key="delivery.id" class="item">
          <div class="item-top">
            <span class="id">#{{ delivery.id }}</span>
            <span
              class="status"
              :style="{ '--status': getStatusColor(delivery.assignment?.status) }"
            >
              {{ getStatusLabel(delivery.assignment?.status) }}
            </span>
          </div>

          <div class="item-body">
            <div class="meta">
              <span>Client</span>
              <strong>{{ delivery.client?.username }}</strong>
            </div>
            <div class="meta">
              <span>Adresse de livraison</span>
              <strong>{{ delivery.delivery_location?.address || 'N/A' }}</strong>
            </div>
            <div v-if="delivery.description" class="meta">
              <span>Description</span>
              <p>{{ delivery.description }}</p>
            </div>
            <div class="meta">
              <span>Assignée le</span>
              <strong>{{ formatDate(delivery.assignment?.assigned_at) }}</strong>
            </div>
          </div>

          <div class="actions">
            <button
              v-if="delivery.assignment?.status === 'assigned'"
              type="button"
              class="btn success"
              :disabled="updatingId === delivery.id"
              @click="acceptDelivery(delivery.id)"
            >
              Accepter
            </button>
            <button
              v-if="delivery.assignment?.status === 'accepted'"
              type="button"
              class="btn info"
              :disabled="updatingId === delivery.id"
              @click="enRouteDelivery(delivery.id)"
            >
              En route
            </button>
            <button
              v-if="delivery.assignment?.status === 'accepted' || delivery.assignment?.status === 'en_route'"
              type="button"
              class="btn primary"
              :disabled="updatingId === delivery.id"
              @click="completeDelivery(delivery.id)"
            >
              Complétée
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { orderService } from '@/services/ordersservices'
import { useWebSocket } from '@/composables/useWebSocket'

const { lastNotification } = useWebSocket()

const deliveries = ref([])
const loading = ref(false)
const error = ref('')
const updatingId = ref(null)

const statusColors = {
  'assigned': '#c47f0e',
  'accepted': '#0f6e8c',
  'en_route': '#1d4ed8',
  'completed': '#0f7b4c',
  'cancelled': '#b42318'
}

const statusLabels = {
  'assigned': 'Assignée',
  'accepted': 'Acceptée',
  'en_route': 'En route',
  'completed': 'Livrée',
  'cancelled': 'Annulée'
}

const getStatusColor = (status) => statusColors[status] || '#667085'
const getStatusLabel = (status) => statusLabels[status] || status

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadDeliveries = async (showLoading = true) => {
  if (showLoading) loading.value = true
  error.value = ''
  try {
    const response = await orderService.getMyDeliveries()
    deliveries.value = response.data
  } catch (err) {
    error.value = err.response?.data?.detail || 'Erreur lors du chargement des livraisons'
    console.error('Error loading deliveries:', err)
  } finally {
    if (showLoading) loading.value = false
  }
}

const acceptDelivery = async (deliveryId) => {
  updatingId.value = deliveryId
  try {
    await orderService.updateAssignmentStatus(deliveryId, 'accept')
    await loadDeliveries()
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.detail || 'Erreur lors de l\'acceptation'
  } finally {
    updatingId.value = null
  }
}

const completeDelivery = async (deliveryId) => {
  updatingId.value = deliveryId
  try {
    await orderService.updateAssignmentStatus(deliveryId, 'complete')
    await loadDeliveries()
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.detail || 'Erreur lors de la mise à jour'
  } finally {
    updatingId.value = null
  }
}

const enRouteDelivery = async (deliveryId) => {
  updatingId.value = deliveryId
  try {
    await orderService.updateAssignmentStatus(deliveryId, 'en_route')
    await loadDeliveries()
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.detail || 'Erreur lors de la mise à jour'
  } finally {
    updatingId.value = null
  }
}

onMounted(() => {
  loadDeliveries()
})

watch(lastNotification, (notification) => {
  if (notification?.order_id) {
    loadDeliveries(false)
  }
})
</script>

<style scoped>
.page {
  --ink: #101828;
  --ink-soft: #475467;
  --paper: #f7f4ef;
  --accent: #f95c19;
  --accent-deep: #d9480f;
  --line: #e4e0d8;
  --err: #b42318;

  min-height: 100vh;
  min-height: 100dvh;
  padding: 5.5rem clamp(1.15rem, 4vw, 3rem) 2.5rem;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Outfit', system-ui, sans-serif;
}

.page-inner {
  max-width: 920px;
  margin: 0 auto;
}

.page-head { margin-bottom: 1.75rem; }

.eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
}

.title {
  margin: 0 0 0.4rem;
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.7rem, 3.5vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.lead { margin: 0; color: var(--ink-soft); }

.feedback {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem 0.9rem;
  border-left: 3px solid;
  font-size: 0.92rem;
}

.feedback.error {
  background: #fef3f2;
  border-color: var(--err);
  color: var(--err);
}

.dismiss {
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.state {
  padding: 2rem 0;
  color: var(--ink-soft);
}

.list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--line);
}

.item {
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--line);
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.id { font-weight: 700; }

.status {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--status);
  padding: 0.25rem 0.55rem;
  background: color-mix(in srgb, var(--status) 12%, white);
}

.item-body {
  display: grid;
  gap: 0.7rem;
  margin-bottom: 1rem;
}

.meta span {
  display: block;
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--ink-soft);
  margin-bottom: 0.15rem;
}

.meta strong,
.meta p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.45;
  word-break: break-word;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.btn {
  flex: 1 1 140px;
  min-height: 44px;
  border: none;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 650;
  cursor: pointer;
  color: #fff;
  touch-action: manipulation;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn.success { background: #0f7b4c; }
.btn.info { background: #0f6e8c; }
.btn.primary { background: var(--accent); }
.btn.primary:hover:not(:disabled) { background: var(--accent-deep); }
</style>
