<template>
  <Navbar />
  
  <div class="content-wrapper">
    <div class="container py-5">
      
      <!-- En-tête + Recherche -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <h2 class="fw-bold mb-0" style="color: #f95c19;">👥 Liste des utilisateurs</h2>
        
        <div class="position-relative" style="min-width: 280px;">
          <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
          <input 
            v-model="search" 
            type="text" 
            class="form-control ps-5 py-2 rounded-pill" 
            placeholder="Rechercher..."
            style="background: #f8f9fa; border: none;"
          >
        </div>
      </div>
      
      <!-- Tableau -->
      <div class="card border-0 shadow-sm rounded-4">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead style="background: #f95c19;">
              <tr class="text-white">
                <th class="ps-4 py-3">ID</th>
                <th>Nom complet</th>
                <th>Email</th>
                <th>Rôle</th>
                <th class="text-center pe-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td class="ps-4 text-muted">#{{ user.id }}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white" 
                         style="width: 40px; height: 40px; background: #f95c19;">
                      {{ user.name.charAt(0) }}
                    </div>
                    {{ user.name }}
                  </div>
                </td>
                <td class="text-muted">{{ user.email }}</td>
                <td>
                  <span class="badge" 
                        :class="user.role === 'Admin' ? 'bg-dark' : 'bg-light text-dark border'">
                    {{ user.role }}
                  </span>
                </td>
                <td class="text-center pe-4">
                  <span class="badge rounded-pill px-3" 
                        :class="{
                          'bg-success': user.status === 'Actif',
                          'bg-warning text-dark': user.status === 'En pause',
                          'bg-info text-dark': user.status === 'Inactif'
                        }">
                    {{ user.status }}
                  </span>
                </td>
              </tr>
              
              <tr v-if="filteredUsers.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  Aucun utilisateur trouvé
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <small class="text-muted mt-3 d-block">
        {{ filteredUsers.length }} résultat(s) sur {{ users.length }}
      </small>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Navbar from '../home/layouts/Navbar.vue';

const search = ref('');

const users = ref([
  { id: 1, name: 'Jean Dupont', email: 'jean.dupont@email.com', role: 'deliverer', status: 'Actif' },
  { id: 2, name: 'Marie Lefèvre', email: 'marie.l@email.com', role: 'Admin', status: 'En pause' },
  { id: 3, name: 'Lucas Bernard', email: 'lucas.b@email.com', role: 'deliverer', status: 'Inactif' },
  { id: 4, name: 'Sophie Martin', email: 'sophie.m@email.com', role: 'deliverer', status: 'Actif' },
]);

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return users.value;
  return users.value.filter(u => 
    u.name.toLowerCase().includes(q) || 
    u.email.toLowerCase().includes(q) ||
    u.role.toLowerCase().includes(q)
  );
});
</script>

<style scoped>
.content-wrapper {
  padding-top: 100px; /* Ajuste selon ta navbar */
  background: #fafafa;
}
</style>