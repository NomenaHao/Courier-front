<template>
  <div class="page">
    <div class="page-inner">
      <header class="page-head">
        <p class="eyebrow">Admin</p>
        <h1 class="title">Administration</h1>
        <p class="lead">Gérez les commandes et assignez les livreurs</p>
      </header>

      <div class="filters" role="group" aria-label="Filtres">
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

      <div v-if="error" class="feedback error">{{ error }}</div>
      <div v-if="loading" class="state">Chargement…</div>
      <div v-else-if="orders.length === 0" class="state">
        Aucune commande dans cette catégorie.
      </div>

      <div v-else class="list">
        <article v-for="order in orders" :key="order.id" class="item">
          <div class="item-top">
            <span class="id">#{{ order.id }}</span>
            <span class="type">
              {{ order.order_type === 'livraison' ? 'Livraison' : 'Récupération' }}
            </span>
            <span class="status">{{ order.status }}</span>
          </div>

          <div class="item-grid">
            <div class="meta">
              <span>Client</span>
              <strong>{{ order.client?.username || '—' }}</strong>
            </div>
            <div class="meta">
              <span>Adresse</span>
              <strong>
                {{ order.delivery_location?.address || order.pickup_location?.address || '—' }}
              </strong>
            </div>
            <div class="meta">
              <span>Livreur</span>
              <strong>{{ order.assignment?.deliverer?.username || 'Non assigné' }}</strong>
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
import { onMounted, reactive, ref, watch } from 'vue'
import { authService, orderService } from '@/services/ordersservices'
import { useWebSocket } from '@/composables/useWebSocket'

const { lastNotification } = useWebSocket()

const orders = ref([])
const deliverers = ref([])
const loading = ref(false)
const error = ref('')
const activeFilter = ref('pending')
const assigningId = ref(null)
const assignSelections = reactive({})

const filters = [
  { label: 'En attente', value: 'pending' },
  { label: 'Assignées', value: 'assigned' },
  { label: 'En cours', value: 'in_transit' },
  { label: 'Toutes', value: '' },
]

const loadOrders = async (showLoading = true) => {
  if (showLoading) loading.value = true
  error.value = ''
  try {
    const params = activeFilter.value ? { status: activeFilter.value } : {}
    const response = await orderService.getAdminOrders(params)
    orders.value = response.data
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
    error.value = err.response?.data?.detail || 'Erreur lors de l\'assignation'
  } finally {
    assigningId.value = null
  }
}

onMounted(async () => {
  try {
    const [deliverersRes] = await Promise.all([
      authService.getDeliverers(),
      loadOrders(),
    ])
    deliverers.value = deliverersRes.data
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

  min-height: 100vh;
  min-height: 100dvh;
  padding: 5.5rem clamp(1.15rem, 4vw, 3rem) 2.5rem;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Outfit', system-ui, sans-serif;
}

.page-inner {
  max-width: 1000px;
  margin: 0 auto;
}

.page-head { margin-bottom: 1.35rem; }

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

.lead { margin: 0; color: var(--ink-soft); }

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 1.35rem;
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

.id { font-weight: 700; }

.type {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink-soft);
}

.status {
  margin-left: auto;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
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
  font-size: 0.95rem;
  line-height: 1.4;
  word-break: break-word;
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
