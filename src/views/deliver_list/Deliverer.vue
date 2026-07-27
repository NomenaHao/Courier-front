<template>
  <div class="page">
    <div class="page-inner">
      <header class="page-head">
        <div class="head-row">
          <div>
            <p class="eyebrow">Équipe</p>
            <h1 class="title">Livreurs</h1>
            <p class="lead">{{ filteredUsers.length }} livreur(s) disponible(s)</p>
          </div>
          <label class="search">
            <span class="sr-only">Rechercher</span>
            <input v-model="search" type="search" placeholder="Rechercher un livreur…" />
          </label>
        </div>
      </header>

      <div v-if="error" class="feedback error">{{ error }}</div>
      <div v-if="loading" class="state">Chargement…</div>

      <div v-else class="list">
        <article v-for="user in filteredUsers" :key="user.id" class="item">
          <div class="avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
          <div class="info">
            <strong>{{ user.username }}</strong>
            <span>{{ user.phone || 'Téléphone non renseigné' }}</span>
          </div>
          <span class="role">Livreur</span>
          <span class="id">#{{ user.id }}</span>
        </article>

        <div v-if="filteredUsers.length === 0" class="state">
          Aucun livreur trouvé
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { authService } from '@/services/ordersservices'

const search = ref('')
const users = ref([])
const loading = ref(false)
const error = ref('')

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return users.value
  return users.value.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      (u.phone && u.phone.toLowerCase().includes(q))
  )
})

onMounted(async () => {
  loading.value = true
  try {
    const response = await authService.getDeliverers()
    users.value = response.data
  } catch {
    error.value = 'Impossible de charger la liste des livreurs'
  } finally {
    loading.value = false
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

.head-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;
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

.lead { margin: 0; color: var(--ink-soft); }

.search {
  width: min(100%, 280px);
}

.search input {
  width: 100%;
  height: 46px;
  padding: 0 0.95rem;
  border: 1px solid var(--line);
  background: #fff;
  font-family: inherit;
  font-size: 16px;
  outline: none;
}

.search input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(249, 92, 25, 0.15);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
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
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  gap: 0.85rem;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--line);
}

.avatar {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.info strong {
  font-size: 1rem;
}

.info span {
  font-size: 0.85rem;
  color: var(--ink-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role {
  font-size: 0.8rem;
  font-weight: 650;
  color: var(--ink-soft);
  border: 1px solid var(--line);
  padding: 0.25rem 0.55rem;
}

.id {
  font-size: 0.85rem;
  color: var(--ink-soft);
  font-weight: 600;
}

@media (max-width: 640px) {
  .head-row {
    align-items: stretch;
  }

  .search {
    width: 100%;
  }

  .item {
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas:
      "avatar info"
      "role role"
      "id id";
  }

  .avatar { grid-area: avatar; }
  .info { grid-area: info; }
  .role { grid-area: role; justify-self: start; }
  .id { grid-area: id; }
}
</style>
