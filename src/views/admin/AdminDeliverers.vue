<template>
  <div class="page">
    <div class="page-grid">
      <section class="card form-card">
        <h2 class="title">Ajouter un livreur</h2>
        <p class="lead">Crée un compte avec le rôle livreur.</p>

        <p v-if="feedback" class="feedback" :class="feedbackType">{{ feedback }}</p>

        <form class="form" @submit.prevent="submit">
          <label class="field">
            <span>Nom d'utilisateur</span>
            <input v-model="form.username" type="text" required autocomplete="off" />
          </label>
          <label class="field">
            <span>Mot de passe</span>
            <input v-model="form.password" type="password" required minlength="6" />
          </label>
          <label class="field">
            <span>Téléphone (optionnel)</span>
            <input v-model="form.phone" type="text" autocomplete="off" />
          </label>
          <button type="submit" class="btn" :disabled="saving">
            {{ saving ? 'Création…' : 'Créer le livreur' }}
          </button>
        </form>
      </section>

      <section class="card list-card">
        <div class="list-head">
          <div>
            <h2 class="title">Livreurs enregistrés</h2>
            <p class="lead">{{ deliverers.length }} livreur(s) dans la base</p>
          </div>
          <button type="button" class="btn ghost" :disabled="loading" @click="loadDeliverers">
            Actualiser
          </button>
        </div>

        <div v-if="error" class="feedback error">{{ error }}</div>
        <div v-if="loading" class="state">Chargement…</div>
        <div v-else-if="deliverers.length === 0" class="state">Aucun livreur pour le moment.</div>
        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Identifiant</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in deliverers" :key="d.id">
                <td>{{ d.id }}</td>
                <td><strong>{{ d.username }}</strong></td>
                <td>{{ d.phone || '—' }}</td>
                <td>{{ d.email || '—' }}</td>
                <td class="col-actions">
                  <button type="button" class="link-btn" @click="openEdit(d)">Modifier</button>
                  <button type="button" class="link-btn danger" @click="removeUser(d)">
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <UserEditDialog
      :open="editOpen"
      :user="editTarget"
      :show-role="false"
      fixed-role="livreur"
      @close="editOpen = false"
      @saved="onUserSaved"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { authService } from '@/services/ordersservices'
import api from '@/services/api'
import UserEditDialog from '@/components/admin/UserEditDialog.vue'

const deliverers = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const feedback = ref('')
const feedbackType = ref('success')

const form = ref({
  username: '',
  password: '',
  phone: '',
})

const editOpen = ref(false)
const editTarget = ref(null)

const loadDeliverers = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await authService.getDeliverers()
    deliverers.value = res.data
  } catch {
    error.value = 'Impossible de charger les livreurs.'
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  saving.value = true
  feedback.value = ''
  try {
    await api.post('auth/register/', {
      username: form.value.username.trim(),
      password: form.value.password,
      role: 'livreur',
      phone: form.value.phone.trim(),
    })
    feedbackType.value = 'success'
    feedback.value = `Livreur « ${form.value.username} » créé.`
    form.value = { username: '', password: '', phone: '' }
    await loadDeliverers()
  } catch (err) {
    feedbackType.value = 'error'
    const data = err.response?.data
    if (data?.username?.[0]) feedback.value = data.username[0]
    else if (typeof data === 'object') {
      const first = Object.values(data).flat?.()[0]
      feedback.value = typeof first === 'string' ? first : 'Création impossible.'
    } else feedback.value = 'Création impossible.'
  } finally {
    saving.value = false
  }
}

const openEdit = (user) => {
  editTarget.value = user
  editOpen.value = true
}

const onUserSaved = () => {
  loadDeliverers()
}

const removeUser = async (user) => {
  const ok = window.confirm(
    `Supprimer le livreur « ${user.username} » ? Cette action est irréversible.`,
  )
  if (!ok) return
  try {
    await authService.deleteUser(user.id)
    await loadDeliverers()
  } catch (err) {
    const detail = err.response?.data?.detail?.[0]
    window.alert(detail || 'Suppression impossible.')
  }
}

onMounted(loadDeliverers)
</script>

<style scoped>
.page {
  --ink: #101828;
  --ink-soft: #475467;
  --panel: #ffffff;
  --accent: #f95c19;
  --accent-deep: #d9480f;
  --line: #e4e0d8;
  --err: #b42318;
  --ok: #0f7b4c;
}

.page-grid {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1.15rem 1.2rem;
}

.title {
  margin: 0 0 0.35rem;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.15rem;
  font-weight: 700;
}

.lead {
  margin: 0 0 1rem;
  font-size: 0.88rem;
  color: var(--ink-soft);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.field span {
  display: block;
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--ink-soft);
  margin-bottom: 0.3rem;
}

.field input {
  width: 100%;
  height: 44px;
  padding: 0 0.85rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: inherit;
  font-size: 16px;
}

.field input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(249, 92, 25, 0.14);
}

.btn {
  height: 44px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-family: inherit;
  font-weight: 650;
  cursor: pointer;
}

.btn:hover:not(:disabled) {
  background: var(--accent-deep);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn.ghost {
  background: #faf8f5;
  color: var(--ink);
  border: 1px solid var(--line);
  padding: 0 0.85rem;
  height: 38px;
  font-size: 0.85rem;
}

.list-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.data-table th,
.data-table td {
  padding: 0.65rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

.data-table th {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
}

.state {
  padding: 1.5rem 0;
  color: var(--ink-soft);
}

.feedback {
  margin-bottom: 0.85rem;
  padding: 0.65rem 0.8rem;
  font-size: 0.88rem;
  border-radius: 8px;
}

.feedback.success {
  background: #ecfdf3;
  color: var(--ok);
}

.feedback.error {
  background: #fef3f2;
  color: var(--err);
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
  color: var(--accent);
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

.link-btn.danger {
  color: var(--err);
}

@media (max-width: 900px) {
  .page-grid {
    grid-template-columns: 1fr;
  }
}
</style>
