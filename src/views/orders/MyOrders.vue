<template>
  <div class="page">
    <div class="page-inner">
      <header class="page-head">
        <p class="eyebrow">Suivi</p>
        <h1 class="title">Mes commandes</h1>
        <p class="lead">Suivez l'état de vos livraisons et récupérations</p>
      </header>

      <div v-if="error" class="feedback error">
        {{ error }}
        <button type="button" class="dismiss" @click="error = ''">Fermer</button>
      </div>

      <div v-if="loading" class="state">Chargement…</div>

      <div v-else-if="orders.length === 0" class="state empty">
        Aucune commande pour le moment.
        <router-link to="/home#deliver_form" class="inline-link">Passer commande</router-link>
      </div>

      <div v-else class="list">
        <article v-for="order in orders" :key="order.id" class="item">
          <div class="item-top">
            <span class="id">#{{ order.id }}</span>
            <span class="type">{{ order.order_type === 'livraison' ? 'Livraison' : 'Récupération' }}</span>
            <span class="status" :style="{ '--status': getOrderStatusColor(order.status) }">
              {{ getOrderStatusLabel(order.status) }}
            </span>
          </div>

          <div class="item-body">
            <div v-if="order.delivery_location?.address" class="meta">
              <span>Adresse de livraison</span>
              <strong>{{ order.delivery_location.address }}</strong>
            </div>
            <div v-if="order.pickup_location?.address" class="meta">
              <span>Adresse de récupération</span>
              <strong>{{ order.pickup_location.address }}</strong>
            </div>
            <div v-if="order.assignment?.deliverer" class="meta">
              <span>Livreur</span>
              <strong>{{ order.assignment.deliverer.username }}</strong>
            </div>
            <div v-if="order.description" class="meta">
              <span>Détails</span>
              <p>{{ order.description }}</p>
            </div>
            <time>{{ formatDate(order.created_at) }}</time>
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

const orders = ref([])
const loading = ref(false)
const error = ref('')

const orderStatusColors = {
  pending: '#c47f0e',
  assigned: '#0f6e8c',
  in_transit: '#1d4ed8',
  delivered: '#0f7b4c',
  cancelled: '#b42318',
  created: '#667085',
  picked_up: '#0e7490',
}

const orderStatusLabels = {
  pending: 'En attente',
  assigned: 'Assignée',
  in_transit: 'En cours',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  created: 'Créée',
  picked_up: 'Récupérée',
}

const getOrderStatusColor = (status) => orderStatusColors[status] || '#667085'
const getOrderStatusLabel = (status) => orderStatusLabels[status] || status

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadOrders = async (showLoading = true) => {
  if (showLoading) loading.value = true
  error.value = ''
  try {
    const response = await orderService.getMyOrders()
    orders.value = response.data
  } catch (err) {
    error.value = err.response?.data?.detail || 'Erreur lors du chargement des commandes'
  } finally {
    if (showLoading) loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})

watch(lastNotification, (notification) => {
  if (notification?.order_id) {
    loadOrders(false)
  }
})
</script>

<style scoped>
.page {
  --ink: #101828;
  --ink-soft: #475467;
  --paper: #f7f4ef;
  --accent: #f95c19;
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

.page-head {
  margin-bottom: 1.75rem;
}

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

.lead {
  margin: 0;
  color: var(--ink-soft);
}

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

.state.empty {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.inline-link {
  color: var(--accent);
  font-weight: 650;
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
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  align-items: center;
  margin-bottom: 0.85rem;
}

.id {
  font-weight: 700;
  color: var(--ink);
}

.type {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink-soft);
}

.status {
  margin-left: auto;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--status);
  padding: 0.25rem 0.55rem;
  background: color-mix(in srgb, var(--status) 12%, white);
}

.item-body {
  display: grid;
  gap: 0.7rem;
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

time {
  font-size: 0.82rem;
  color: var(--ink-soft);
}

@media (max-width: 560px) {
  .status {
    margin-left: 0;
  }
}
</style>
