<template>
  <div class="page">
    <div class="page-inner">
      <header class="page-head">
        <p class="eyebrow">Admin</p>
        <h1 class="title">Toutes les commandes</h1>
        <p class="lead">Consultez chaque commande, le client et le livreur assigné</p>
      </header>

      <div class="toolbar">
        <input
          v-model="searchQuery"
          type="search"
          class="search"
          placeholder="Rechercher (#id, client, adresse…)"
          aria-label="Rechercher une commande"
        />

        <div class="toolbar-filters">
          <select v-model="typeFilter" class="select" aria-label="Type de commande" @change="loadOrders">
            <option value="">Tous les types</option>
            <option value="livraison">Livraison</option>
            <option value="recuperation">Récupération</option>
          </select>

          <select v-model="clientFilter" class="select" aria-label="Filtrer par client" @change="loadOrders">
            <option value="">Tous les clients</option>
            <option v-for="c in clients" :key="c.id" :value="c.id">
              {{ c.username }}
            </option>
          </select>

          <select v-model="delivererFilter" class="select" aria-label="Filtrer par livreur" @change="loadOrders">
            <option value="">Tous les livreurs</option>
            <option value="none">Non assigné</option>
            <option v-for="d in deliverers" :key="d.id" :value="d.id">
              {{ d.username }}
            </option>
          </select>
        </div>
      </div>

      <div class="filters" role="group" aria-label="Filtres par statut">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          class="filter-btn"
          :class="{ active: activeFilter === filter.value }"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <p v-if="!loading" class="count">
        {{ filteredOrders.length }} commande{{ filteredOrders.length !== 1 ? 's' : '' }}
      </p>

      <div v-if="error" class="feedback error">{{ error }}</div>
      <div v-if="loading" class="state">Chargement…</div>
      <div v-else-if="filteredOrders.length === 0" class="state">
        Aucune commande ne correspond à vos critères.
      </div>

      <div v-else class="list">
        <article v-for="order in filteredOrders" :key="order.id" class="item">
          <div class="item-top">
            <span class="id">#{{ order.id }}</span>
            <span class="type">
              {{ order.order_type === 'livraison' ? 'Livraison' : 'Récupération' }}
            </span>
            <span
              class="status"
              :style="{ '--status': getOrderStatusColor(order.status) }"
            >
              {{ getOrderStatusLabel(order.status) }}
            </span>
          </div>

          <div class="item-grid">
            <div class="meta">
              <span>Client</span>
              <strong>{{ order.client?.username || '—' }}</strong>
              <small v-if="order.client?.phone">{{ order.client.phone }}</small>
            </div>
            <div class="meta">
              <span>Livreur</span>
              <strong>{{ order.assignment?.deliverer?.username || 'Non assigné' }}</strong>
              <small v-if="order.assignment?.status">
                {{ getAssignmentStatusLabel(order.assignment.status) }}
              </small>
            </div>
            <div class="meta">
              <span>Créée le</span>
              <strong>{{ formatDate(order.created_at) }}</strong>
            </div>
            <div v-if="order.pickup_location?.address" class="meta">
              <span>Point de départ</span>
              <strong>{{ order.pickup_location.address }}</strong>
            </div>
            <div v-if="order.delivery_location?.address" class="meta">
              <span>Destination</span>
              <strong>{{ order.delivery_location.address }}</strong>
            </div>
            <div v-if="order.description" class="meta meta-wide">
              <span>Description</span>
              <strong>{{ order.description }}</strong>
            </div>
          </div>

          <div
            v-if="order.status === 'pending' || (order.order_type === 'recuperation' && !order.assignment)"
            class="assign"
          >
            <select v-model="assignSelections[order.id]">
              <option value="">Choisir un livreur…</option>
              <option v-for="d in deliverers" :key="d.id" :value="d.id">
                {{ d.username }}
              </option>
            </select>
            <button
              type="button"
              class="assign-btn"
              :disabled="!assignSelections[order.id] || assigningId === order.id"
              @click="assignDeliverer(order.id)"
            >
              {{ assigningId === order.id ? '…' : 'Assigner' }}
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { authService, orderService } from '@/services/ordersservices'
import { useWebSocket } from '@/composables/useWebSocket'

const { lastNotification } = useWebSocket()

const orders = ref([])
const deliverers = ref([])
const clients = ref([])
const loading = ref(false)
const error = ref('')
const activeFilter = ref('')
const typeFilter = ref('')
const clientFilter = ref('')
const delivererFilter = ref('')
const searchQuery = ref('')
const assigningId = ref(null)
const assignSelections = reactive({})

const filters = [
  { label: 'Toutes', value: '' },
  { label: 'En attente', value: 'pending' },
  { label: 'Assignées', value: 'assigned' },
  { label: 'En cours', value: 'in_transit' },
  { label: 'Livrées', value: 'delivered' },
  { label: 'Annulées', value: 'cancelled' },
]

const orderStatusLabels = {
  created: 'Créée',
  pending: 'En attente',
  assigned: 'Assignée',
  picked_up: 'Récupérée',
  in_transit: 'En cours',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const orderStatusColors = {
  created: '#667085',
  pending: '#c47f0e',
  assigned: '#0f6e8c',
  picked_up: '#1d4ed8',
  in_transit: '#1d4ed8',
  delivered: '#0f7b4c',
  cancelled: '#b42318',
}

const assignmentStatusLabels = {
  assigned: 'Assignée',
  accepted: 'Acceptée',
  en_route: 'En route',
  completed: 'Terminée',
  cancelled: 'Annulée',
}

const getOrderStatusLabel = (status) => orderStatusLabels[status] || status
const getOrderStatusColor = (status) => orderStatusColors[status] || '#667085'
const getAssignmentStatusLabel = (status) => assignmentStatusLabels[status] || status

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const filteredOrders = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return orders.value

  return orders.value.filter((order) => {
    const haystack = [
      String(order.id),
      order.client?.username,
      order.client?.phone,
      order.assignment?.deliverer?.username,
      order.pickup_location?.address,
      order.delivery_location?.address,
      order.description,
      getOrderStatusLabel(order.status),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
})

const buildParams = () => {
  const params = {}
  if (activeFilter.value) params.status = activeFilter.value
  if (typeFilter.value) params.order_type = typeFilter.value
  if (clientFilter.value) params.client_id = clientFilter.value
  if (delivererFilter.value && delivererFilter.value !== 'none') {
    params.deliverer_id = delivererFilter.value
  }
  return params
}

const loadOrders = async (showLoading = true) => {
  if (showLoading) loading.value = true
  error.value = ''
  try {
    const response = await orderService.getAdminOrders(buildParams())
    let data = response.data

    if (delivererFilter.value === 'none') {
      data = data.filter((order) => !order.assignment?.deliverer)
    }

    orders.value = data
  } catch (err) {
    error.value = err.response?.data?.detail || 'Erreur de chargement'
  } finally {
    if (showLoading) loading.value = false
  }
}

const setFilter = (value) => {
  activeFilter.value = value
  loadOrders()
}

const assignDeliverer = async (orderId) => {
  const delivererId = assignSelections[orderId]
  if (!delivererId) return

  assigningId.value = orderId
  try {
    await orderService.assignDeliverer(orderId, delivererId)
    assignSelections[orderId] = ''
    await loadOrders()
  } catch (err) {
    error.value = err.response?.data?.detail || "Erreur lors de l'assignation"
  } finally {
    assigningId.value = null
  }
}

onMounted(async () => {
  try {
    const [deliverersRes, clientsRes] = await Promise.all([
      authService.getDeliverers(),
      authService.getClients(),
      loadOrders(),
    ])
    deliverers.value = deliverersRes.data
    clients.value = clientsRes.data
  } catch {
    error.value = 'Impossible de charger les données admin'
  }
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
  --accent-deep: #d9480f;
  --line: #e4e0d8;
  --err: #b42318;

  padding: 0 0 1rem;
  background: transparent;
  color: var(--ink);
  font-family: 'Outfit', system-ui, sans-serif;
}

.page-inner {
  max-width: none;
  margin: 0;
}

.page-head {
  margin-bottom: 1.35rem;
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
  margin: 0 0 0.35rem;
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.7rem, 3.5vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.lead {
  margin: 0;
  color: var(--ink-soft);
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.search {
  width: 100%;
  height: 44px;
  padding: 0 0.9rem;
  border: 1px solid var(--line);
  background: #fff;
  font-family: inherit;
  font-size: 16px;
  outline: none;
}

.search:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(249, 92, 25, 0.15);
}

.toolbar-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.select {
  flex: 1 1 160px;
  height: 44px;
  padding: 0 0.85rem;
  border: 1px solid var(--line);
  background: #fff;
  font-family: inherit;
  font-size: 16px;
  outline: none;
}

.select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(249, 92, 25, 0.15);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.75rem;
}

.filter-btn {
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink-soft);
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 650;
  padding: 0.55rem 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.filter-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.count {
  margin: 0 0 1rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink-soft);
}

.feedback.error {
  margin-bottom: 1rem;
  padding: 0.75rem 0.9rem;
  background: #fef3f2;
  border-left: 3px solid var(--err);
  color: var(--err);
  font-size: 0.92rem;
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
  padding: 1.2rem 0;
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
  color: var(--status, var(--accent));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  margin-bottom: 0.85rem;
}

.meta span {
  display: block;
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--ink-soft);
  margin-bottom: 0.15rem;
}

.meta strong {
  display: block;
  font-size: 0.95rem;
  line-height: 1.4;
  word-break: break-word;
}

.meta small {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.82rem;
  color: var(--ink-soft);
}

.meta-wide {
  grid-column: 1 / -1;
}

.assign {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.assign select {
  flex: 1 1 180px;
  height: 44px;
  padding: 0 0.85rem;
  border: 1px solid var(--line);
  background: #fff;
  font-family: inherit;
  font-size: 16px;
  outline: none;
}

.assign select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(249, 92, 25, 0.15);
}

.assign-btn {
  height: 44px;
  padding: 0 1.1rem;
  border: none;
  background: var(--accent);
  color: #fff;
  font-family: inherit;
  font-weight: 650;
  cursor: pointer;
}

.assign-btn:hover:not(:disabled) {
  background: var(--accent-deep);
}

.assign-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 760px) {
  .item-grid {
    grid-template-columns: 1fr;
  }

  .status {
    margin-left: 0;
  }

  .assign {
    flex-direction: column;
  }

  .assign select,
  .assign-btn {
    width: 100%;
  }
}
</style>
