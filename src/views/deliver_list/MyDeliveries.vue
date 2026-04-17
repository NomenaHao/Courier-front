<template>
  <div class="content-wrapper">
    <div class="container py-5">
      <!-- En-tête -->
      <div class="mb-4">
        <h2 class="fw-bold" style="color: #f95c19;">🚚 Mes Livraisons</h2>
        <p class="text-muted">Gérez vos livraisons assignées</p>
      </div>

      <!-- Message d'erreur -->
      <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ error }}
        <button type="button" class="btn-close" @click="error = ''"></button>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <!-- Aucune livraison -->
      <div v-else-if="deliveries.length === 0" class="alert alert-info">
        <i class="bi bi-info-circle"></i> Aucune livraison assignée pour le moment.
      </div>

      <!-- Liste des livraisons -->
      <div v-else class="row g-3">
        <div v-for="delivery in deliveries" :key="delivery.id" class="col-md-6 col-lg-4">
          <div class="card border-0 shadow-sm rounded-3 h-100">
            <!-- Statut badge -->
            <div class="card-header" :style="{ background: getStatusColor(delivery.assignment.status) }">
              <div class="d-flex justify-content-between align-items-center">
                <span class="badge bg-light text-dark">Commission #{{ delivery.id }}</span>
                <span class="badge" :style="{ background: getStatusColor(delivery.assignment.status) }">
                  {{ getStatusLabel(delivery.assignment.status) }}
                </span>
              </div>
            </div>

            <div class="card-body">
              <!-- Infos Client -->
              <div class="mb-3">
                <small class="text-muted d-block">Client</small>
                <strong>{{ delivery.client.username }}</strong>
              </div>

              <!-- Adresse de livraison -->
              <div class="mb-3">
                <small class="text-muted d-block">
                  <i class="bi bi-geo-alt"></i> Adresse de livraison
                </small>
                <strong class="text-break">{{ delivery.delivery_location?.address || 'N/A' }}</strong>
              </div>

              <!-- Description -->
              <div v-if="delivery.description" class="mb-3">
                <small class="text-muted d-block">Description</small>
                <p class="small mb-0">{{ delivery.description }}</p>
              </div>

              <!-- Dates -->
              <div class="mb-3">
                <small class="text-muted d-block">
                  <i class="bi bi-calendar"></i> Assignée le
                </small>
                <small>{{ formatDate(delivery.assignment.assigned_at) }}</small>
              </div>
            </div>

            <!-- Actions -->
            <div class="card-footer bg-light border-top-0">
              <div class="d-flex gap-2">
                <button 
                  v-if="delivery.assignment.status === 'assigned'"
                  @click="acceptDelivery(delivery.id)"
                  class="btn btn-sm btn-success flex-grow-1"
                  :disabled="updatingId === delivery.id"
                >
                  <i class="bi bi-check-circle"></i> Accepter
                </button>
                <button 
                  v-if="delivery.assignment.status === 'accepted'"
                  @click="completeDelivery(delivery.id)"
                  class="btn btn-sm btn-primary flex-grow-1"
                  :disabled="updatingId === delivery.id"
                >
                  <i class="bi bi-flag"></i> Complétée
                </button>
                <button 
                  @click="viewDetails(delivery)"
                  class="btn btn-sm btn-outline-secondary flex-grow-1"
                >
                  <i class="bi bi-eye"></i> Détails
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const deliveries = ref([])
const loading = ref(false)
const error = ref('')
const updatingId = ref(null)

const statusColors = {
  'assigned': '#ffc107',
  'accepted': '#17a2b8',
  'en_route': '#0d6efd',
  'completed': '#198754',
  'cancelled': '#dc3545'
}

const statusLabels = {
  'assigned': '🔔 Assignée',
  'accepted': '✅ Acceptée',
  'en_route': '🚗 En route',
  'completed': '✔️ Livrée',
  'cancelled': '❌ Annulée'
}

const getStatusColor = (status) => statusColors[status] || '#6c757d'
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

const loadDeliveries = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('orders/my-deliveries/')
    deliveries.value = response.data
  } catch (err) {
    error.value = err.response?.data?.detail || 'Erreur lors du chargement des livraisons'
    console.error('Error loading deliveries:', err)
  } finally {
    loading.value = false
  }
}

const acceptDelivery = async (deliveryId) => {
  updatingId.value = deliveryId
  try {
    // À implémenter: endpoint pour accepter une livraison
    console.log('Accept delivery:', deliveryId)
    error.value = ''
  } catch (err) {
    error.value = 'Erreur lors de l\'acceptation'
  } finally {
    updatingId.value = null
  }
}

const completeDelivery = async (deliveryId) => {
  updatingId.value = deliveryId
  try {
    // À implémenter: endpoint pour marquer comme complétée
    console.log('Complete delivery:', deliveryId)
    error.value = ''
  } catch (err) {
    error.value = 'Erreur lors de la mise à jour'
  } finally {
    updatingId.value = null
  }
}

const viewDetails = (delivery) => {
  console.log('View details:', delivery)
  // Vous pouvez ajouter une modal ou naviguer vers une page de détails
}

onMounted(() => {
  loadDeliveries()
})
</script>

<style scoped>
.content-wrapper {
  min-height: calc(100vh - 60px);
  background: #f8f9fa;
}

.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
}

.card-header {
  color: white;
  padding: 1.25rem;
}

.btn-sm {
  font-size: 0.85rem;
}
</style>
