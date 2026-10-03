<template>
  <div class="dash">
    <div v-if="error" class="feedback error">{{ error }}</div>

    <div class="dash-grid">
      <aside class="dash-side">
        <section class="card kpi-card">
          <div class="kpi-head">
            <h2 class="card-title">Commandes</h2>
          </div>
          <div class="kpi-hero">
            <span class="kpi-label">Actives</span>
            <strong class="kpi-value">{{ stats.activeTotal }}</strong>
            <span class="kpi-hint">{{ stats.total }} au total</span>
          </div>
          <div class="mini-stats">
            <div class="mini-stat">
              <span>En cours</span>
              <strong>{{ stats.inTransit }}</strong>
              <i class="mini-bar" :style="{ '--w': pct(stats.inTransit) }"></i>
            </div>
            <div class="mini-stat">
              <span>Assignées</span>
              <strong>{{ stats.assigned }}</strong>
              <i class="mini-bar assigned" :style="{ '--w': pct(stats.assigned) }"></i>
            </div>
            <div class="mini-stat">
              <span>Livrées</span>
              <strong>{{ stats.delivered }}</strong>
              <i class="mini-bar done" :style="{ '--w': pct(stats.delivered) }"></i>
            </div>
          </div>
        </section>

        <section class="card">
          <h2 class="card-title">Récupérations</h2>
          <div class="split-stat">
            <div>
              <span class="stat-label">En attente d’assignation</span>
              <strong class="stat-value">{{ stats.pendingPickup }}</strong>
            </div>
            <div class="ring" :style="{ '--p': pickupPct }">
              <span>{{ pickupPct }}%</span>
            </div>
          </div>
          <p class="card-note">{{ stats.recuperationTotal }} récupération(s) enregistrée(s)</p>
        </section>

        <section class="card">
          <h2 class="card-title">Équipe</h2>
          <div class="team-row">
            <div class="team-chip">
              <span>Livreurs</span>
              <strong>{{ stats.deliverers }}</strong>
            </div>
            <div class="team-chip">
              <span>Clients</span>
              <strong>{{ stats.clients }}</strong>
            </div>
          </div>
        </section>
      </aside>

      <section class="card dash-main">
        <div class="main-head">
          <div>
            <h2 class="card-title">Flux client → livreur</h2>
            <p class="card-sub">Mises à jour automatiques à chaque nouvelle commande</p>
          </div>
        </div>

        <div class="table-tabs" role="tablist">
          <button
            v-for="tab in tableTabs"
            :key="tab.value"
            type="button"
            class="tab-btn"
            :class="{ active: tableTab === tab.value }"
            @click="tableTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="loading" class="state">Chargement…</div>
        <div v-else-if="tableOrders.length === 0" class="state">Aucune commande dans cette vue.</div>
        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Client</th>
                <th>Livreur</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in tableOrders"
                :key="order.id"
                :class="{ flash: order.id === highlightId }"
              >
                <td class="mono">{{ order.id }}</td>
                <td>{{ order.order_type === 'livraison' ? 'Livraison' : 'Récupération' }}</td>
                <td>
                  <span class="cell-main">{{ order.client?.username || '—' }}</span>
                </td>
                <td>
                  <span class="cell-main">{{
                    order.assignment?.deliverer?.username || 'Non assigné'
                  }}</span>
                </td>
                <td>
                  <span class="pill" :class="order.status">{{ statusLabel(order.status) }}</span>
                </td>
                <td class="date">{{ formatDate(order.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { authService, orderService } from '@/services/ordersservices'
import { useWebSocket } from '@/composables/useWebSocket'

const { lastNotification } = useWebSocket()

const loading = ref(true)
const error = ref('')
const orders = ref([])
const tableTab = ref('active')
const highlightId = ref(null)
const liveConnected = ref(false)

const tableTabs = [
  { label: 'En cours', value: 'active' },
  { label: 'Toutes', value: 'all' },
  { label: 'Récupérations', value: 'recuperation' },
]

const stats = ref({
  total: 0,
  activeTotal: 0,
  inTransit: 0,
  assigned: 0,
  delivered: 0,
  pendingPickup: 0,
  recuperationTotal: 0,
  deliverers: 0,
  clients: 0,
})

const statusLabels = {
  pending: 'En attente',
  assigned: 'Assignée',
  in_transit: 'En cours',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const statusLabel = (s) => statusLabels[s] || s

const activeStatuses = new Set(['pending', 'assigned', 'in_transit', 'picked_up', 'created'])

const tableOrders = computed(() => {
  let list = [...orders.value]
  if (tableTab.value === 'active') {
    list = list.filter((o) => activeStatuses.has(o.status))
  } else if (tableTab.value === 'recuperation') {
    list = list.filter((o) => o.order_type === 'recuperation')
  }
  return list.slice(0, 25)
})

const pickupPct = computed(() => {
  if (!stats.value.recuperationTotal) return 0
  return Math.round((stats.value.pendingPickup / stats.value.recuperationTotal) * 100)
})

const pct = (n) => {
  const max = Math.max(stats.value.inTransit, stats.value.assigned, stats.value.delivered, 1)
  return `${Math.round((n / max) * 100)}%`
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const computeStats = (list) => {
  stats.value.total = list.length
  stats.value.inTransit = list.filter((o) => o.status === 'in_transit').length
  stats.value.assigned = list.filter((o) => o.status === 'assigned').length
  stats.value.delivered = list.filter((o) => o.status === 'delivered').length
  stats.value.activeTotal = list.filter((o) => activeStatuses.has(o.status)).length
  const recups = list.filter((o) => o.order_type === 'recuperation')
  stats.value.recuperationTotal = recups.length
  stats.value.pendingPickup = recups.filter((o) => o.status === 'pending').length
}

const loadDashboard = async (showLoading = true) => {
  if (showLoading) loading.value = true
  error.value = ''
  try {
    const [ordersRes, deliverersRes, clientsRes] = await Promise.all([
      orderService.getAdminOrders(),
      authService.getDeliverers(),
      authService.getClients(),
    ])
    orders.value = ordersRes.data
    stats.value.deliverers = deliverersRes.data.length
    stats.value.clients = clientsRes.data.length
    computeStats(orders.value)
    liveConnected.value = true
  } catch {
    error.value = 'Impossible de charger le dashboard.'
  } finally {
    if (showLoading) loading.value = false
  }
}

const pulseRow = (orderId) => {
  if (!orderId) return
  highlightId.value = orderId
  setTimeout(() => {
    if (highlightId.value === orderId) highlightId.value = null
  }, 2500)
}

onMounted(() => loadDashboard())

watch(lastNotification, (notification) => {
  if (!notification?.order_id) return
  loadDashboard(false)
  pulseRow(notification.order_id)
})
</script>

<style scoped>
.dash {
  --ink: #101828;
  --ink-soft: #475467;
  --panel: #ffffff;
  --accent: #f95c19;
  --line: #e4e0d8;
  --err: #b42318;
  --navy: #0b1324;
}

.dash-grid {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.dash-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1.1rem 1.15rem;
}

.card-title {
  margin: 0;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.05rem;
  font-weight: 700;
}

.kpi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.live-badge {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.25rem 0.45rem;
  border-radius: 999px;
  background: #efeae2;
  color: var(--ink-soft);
}

.live-badge.on {
  background: rgba(249, 92, 25, 0.15);
  color: var(--accent);
}

.kpi-hero {
  margin-bottom: 1rem;
}

.kpi-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--ink-soft);
}

.kpi-value {
  display: block;
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.kpi-hint {
  font-size: 0.82rem;
  color: var(--ink-soft);
}

.mini-stats {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.mini-stat {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 0.15rem 0.5rem;
  align-items: center;
}

.mini-stat span {
  font-size: 0.78rem;
  color: var(--ink-soft);
}

.mini-stat strong {
  font-size: 1rem;
  text-align: right;
}

.mini-bar {
  grid-column: 1 / -1;
  display: block;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, #1d4ed8 var(--w), #efeae2 var(--w));
}

.mini-bar.assigned {
  background: linear-gradient(90deg, #0f6e8c var(--w), #efeae2 var(--w));
}

.mini-bar.done {
  background: linear-gradient(90deg, #0f7b4c var(--w), #efeae2 var(--w));
}

.split-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.stat-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--ink-soft);
  margin-bottom: 0.2rem;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
}

.ring {
  --p: 0;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  background: conic-gradient(var(--accent) calc(var(--p) * 1%), #efeae2 0);
  position: relative;
}

.ring span {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: var(--panel);
  display: grid;
  place-items: center;
}

.team-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
}

.team-chip {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #faf8f5;
}

.team-chip span {
  display: block;
  font-size: 0.75rem;
  color: var(--ink-soft);
}

.team-chip strong {
  font-size: 1.25rem;
}

.card-sub {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.card-note {
  margin: 0.75rem 0 0;
  font-size: 0.82rem;
  color: var(--ink-soft);
}

.main-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.table-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--line);
}

.tab-btn {
  border: 1px solid var(--line);
  background: #faf8f5;
  color: var(--ink-soft);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 650;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
}

.tab-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.link-more {
  font-size: 0.88rem;
  font-weight: 650;
  color: var(--accent);
  text-decoration: none;
}

.link-more:hover {
  text-decoration: underline;
}

.table-wrap {
  overflow-x: auto;
  max-height: min(520px, 60vh);
  overflow-y: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.data-table th,
.data-table td {
  padding: 0.7rem 0.55rem;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

.data-table th {
  position: sticky;
  top: 0;
  background: var(--panel);
  z-index: 1;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.data-table tbody tr.flash {
  animation: row-flash 2s ease;
}

@keyframes row-flash {
  0% {
    background: rgba(249, 92, 25, 0.22);
  }
  100% {
    background: transparent;
  }
}

.mono {
  font-weight: 700;
}

.cell-main {
  font-weight: 600;
}

.date {
  font-size: 0.8rem;
  color: var(--ink-soft);
  white-space: nowrap;
}

.pill {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 650;
  background: rgba(249, 92, 25, 0.12);
  color: var(--accent);
  border-radius: 999px;
}

.pill.in_transit,
.pill.assigned {
  background: rgba(15, 110, 140, 0.12);
  color: #0f6e8c;
}

.pill.delivered {
  background: rgba(15, 123, 76, 0.12);
  color: #0f7b4c;
}

.pill.pending {
  background: rgba(196, 127, 14, 0.15);
  color: #c47f0e;
}

.state {
  padding: 1.5rem 0;
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

@media (max-width: 960px) {
  .dash-grid {
    grid-template-columns: 1fr;
  }
}
</style>
