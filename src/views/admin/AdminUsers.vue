<template>
  <div class="placeholder">
    <section class="card">
      <h2 class="title">Utilisateurs</h2>
      <p v-if="error" class="lead">{{ error }}</p>
      <p v-else-if="loading" class="lead">Chargement…</p>
      <p v-else-if="!users.length" class="lead">Aucun utilisateur.</p>
      <table v-else>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th>Rôle</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.username }}</td>
            <td>{{ u.phone || '—' }}</td>
            <td>{{ u.email || '—' }}</td>
            <td>{{ u.role }}</td>
            <td class="col-actions">
              <button type="button" class="link-btn" @click="openEdit(u)">Modifier</button>
              <button type="button" class="link-btn danger" @click="removeUser(u)">
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <UserEditDialog
      :open="editOpen"
      :user="editTarget"
      :show-role="false"
      fixed-role="client"
      @close="editOpen = false"
      @saved="loadUsers"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { authService } from '@/services/ordersservices'
import UserEditDialog from '@/components/admin/UserEditDialog.vue'

const users = ref([])
const loading = ref(true)
const error = ref('')
const editOpen = ref(false)
const editTarget = ref(null)

const loadUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await authService.getClients()
    users.value = res.data
  } catch {
    error.value = 'Impossible de charger les utilisateurs.'
  } finally {
    loading.value = false
  }
}

const openEdit = (user) => {
  editTarget.value = user
  editOpen.value = true
}

const removeUser = async (user) => {
  const ok = window.confirm(
    `Supprimer l'utilisateur « ${user.username} » ? Cette action est irréversible.`,
  )
  if (!ok) return
  try {
    await authService.deleteUser(user.id)
    await loadUsers()
  } catch (err) {
    const detail = err.response?.data?.detail?.[0]
    window.alert(detail || 'Suppression impossible.')
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.placeholder {
  --panel: #ffffff;
  --line: #e4e0d8;
  --ink-soft: #475467;
}

.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 2rem 1.25rem;
}

.title {
  margin: 0 0 0.5rem;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.25rem;
}

.lead {
  margin: 0;
  color: var(--ink-soft);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.75rem;
  font-size: 0.95rem;
}

th,
td {
  text-align: left;
  padding: 0.65rem 0.5rem;
  border-bottom: 1px solid var(--line);
}

th {
  color: var(--ink-soft);
  font-weight: 600;
  font-size: 0.8rem;
}

.col-actions {
  white-space: nowrap;
  text-align: right;
}

.link-btn {
  border: none;
  background: none;
  padding: 0.25rem 0.4rem;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 650;
  color: #f95c19;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

.link-btn.danger {
  color: #b42318;
}
</style>
