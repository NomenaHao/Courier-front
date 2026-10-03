<template>
  <div class="page">
    <div class="page-inner">
      <header class="page-head">
        <p class="eyebrow">Suivi</p>
        <h1 class="title">Mes commandes</h1>
        <p class="lead">{{ lead }}</p>
      </header>

      <div v-if="error" class="feedback error">
        {{ error }}
        <button type="button" class="dismiss" @click="error = ''">Fermer</button>
      </div>

      <div v-if="loading" class="state">Chargement…</div>

      <div v-else-if="orders.length === 0" class="state empty">
        <p>Aucune commande pour le moment.</p>
        <router-link to="/home#deliver_form" class="inline-link">Passer commande</router-link>
      </div>

      <div v-else class="list">
        <article v-for="order in orders" :key="order.id" class="item">
          <div class="rail">
            <span class="id">#{{ order.id }}</span>
            <span class="type">{{ order.order_type === 'livraison' ? 'Livraison' : 'Récupération' }}</span>
          </div>

          <div class="main">
            <strong class="place">{{ placeOf(order) }}</strong>
            <p v-if="order.description" class="detail">{{ order.description }}</p>
            <div v-if="order.assignment?.deliverer" class="who">
              <img
                class="who-avatar"
                :src="`https://api.dicebear.com/10.x/lorelei/svg?seed=${encodeURIComponent(order.assignment.deliverer.username)}`"
                alt=""
              />
              <span>{{ order.assignment.deliverer.username }}</span>
            </div>
            <p v-else class="who muted">Livreur non assigné</p>
            <time>{{ formatDate(order.created_at) }}</time>
          </div>

          <span class="status" :style="{ '--status': getOrderStatusColor(order.status) }">
            {{ getOrderStatusLabel(order.status) }}
          </span>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
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

const lead = computed(() => {
  const n = orders.value.length
  if (!n) return 'Livraisons et récupérations'
  return n === 1 ? '1 commande' : `${n} commandes`
})

const placeOf = (order) => {
  if (order.order_type === 'recuperation') {
    return order.pickup_location?.address || 'Adresse de récupération non renseignée'
  }
  return order.delivery_location?.address || order.pickup_location?.address || 'Adresse non renseignée'
}

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

.state.empty p {
  margin: 0 0 0.65rem;
}

.inline-link {
  color: var(--accent);
  font-weight: 650;
  text-decoration: none;
}

.inline-link:hover {
  text-decoration: underline;
}

.list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--line);
}

.item {
  display: grid;
  grid-template-columns: 7.25rem minmax(0, 1fr) auto;
  gap: 0.85rem 1.15rem;
  align-items: start;
  padding: 1.15rem 0.35rem;
  border-bottom: 1px solid var(--line);
  transition: background 0.18s ease;
}

.item:hover {
  background: #fff;
}

.rail {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-top: 0.15rem;
}

.id {
  font-weight: 700;
  letter-spacing: -0.02em;
}

.type {
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.place {
  font-size: 1.02rem;
  line-height: 1.35;
  font-weight: 650;
}

.detail {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.92rem;
  line-height: 1.45;
}

.who {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0.15rem 0 0;
  font-size: 0.88rem;
}

.who.muted {
  color: var(--ink-soft);
}

.who-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: cover;
}

time {
  font-size: 0.8rem;
  color: var(--ink-soft);
}

.status {
  justify-self: end;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--status);
  padding: 0.28rem 0.55rem;
  background: color-mix(in srgb, var(--status) 12%, white);
}

@media (max-width: 640px) {
  .item {
    grid-template-columns: 1fr auto;
  }

  .rail {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: baseline;
    gap: 0.65rem;
  }

  .status {
    grid-column: 2;
    grid-row: 2;
  }
}
</style>
