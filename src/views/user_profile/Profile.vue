<template>
  <div class="page">
    <div class="page-inner">
      <header class="page-head">
        <div class="identity">
          <img class="avatar" :src="avatarUrl" alt="" />
          <div>
            <p class="eyebrow">Profil</p>
            <h1 class="title">{{ userProfile.username || 'Mon profil' }}</h1>
            <p class="lead">Connecté en tant que <strong>{{ roleLabel }}</strong></p>
          </div>
        </div>
      </header>

      <div v-if="loading" class="state">Chargement du profil…</div>

      <section v-else class="panel">
        <h2 class="panel-title">Informations personnelles</h2>

        <div v-if="feedback" class="feedback" :class="feedbackType">{{ feedback }}</div>

        <form class="form" @submit.prevent="saveProfile">
          <label class="field">
            <span>Nom d'utilisateur</span>
            <input v-model="form.username" type="text" required />
          </label>

          <label class="field">
            <span>Email</span>
            <input v-model="form.email" type="email" placeholder="vous@email.com" />
          </label>

          <label class="field">
            <span>Téléphone</span>
            <input v-model="form.phone" type="tel" placeholder="Ex. 034 00 000 00" />
          </label>

          <label class="field">
            <span>Nouveau mot de passe (optionnel)</span>
            <PasswordField
              v-model="form.password"
              autocomplete="new-password"
              minlength="6"
              placeholder="Min. 6 caractères"
            />
          </label>

          <button class="submit-btn" type="submit" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { authService } from '@/services/ordersservices'
import PasswordField from '@/components/PasswordField.vue'

const userProfile = ref({ username: '', email: '', phone: '', role: '' })
const form = reactive({ username: '', email: '', phone: '', password: '' })
const loading = ref(true)
const saving = ref(false)
const feedback = ref('')
const feedbackType = ref('success')

const roleLabels = {
  client: 'Client',
  livreur: 'Livreur',
  admin: 'Administrateur',
}

const roleLabel = computed(() => roleLabels[userProfile.value.role] || userProfile.value.role)
const avatarUrl = computed(
  () => `https://api.dicebear.com/10.x/lorelei/svg?seed=${encodeURIComponent(userProfile.value.username || 'user')}`,
)

onMounted(async () => {
    try {
        const response = await authService.getProfile()
        userProfile.value = response.data
        form.username = response.data.username
        form.email = response.data.email || ''
        form.phone = response.data.phone || ''
    } catch (error) {
        console.error('Error fetching profile:', error)
        feedbackType.value = 'error'
        feedback.value = 'Impossible de charger le profil'
    } finally {
        loading.value = false
    }
})

const saveProfile = async () => {
    saving.value = true
    feedback.value = ''
    try {
        const payload = {
            username: form.username,
            email: form.email,
            phone: form.phone,
        }
        if (form.password.trim()) payload.password = form.password
        const response = await authService.updateProfile(payload)
        form.password = ''
        userProfile.value = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
        feedbackType.value = 'success'
        feedback.value = 'Profil mis à jour avec succès'
    } catch {
        feedbackType.value = 'error'
        feedback.value = 'Erreur lors de la mise à jour'
    } finally {
        saving.value = false
    }
}
</script>

<style scoped>
.page {
  --ink: #101828;
  --ink-soft: #475467;
  --paper: #f7f4ef;
  --panel: #ffffff;
  --accent: #f95c19;
  --accent-deep: #d9480f;
  --line: #e4e0d8;
  --ok: #0f7b4c;
  --err: #b42318;

  min-height: 100vh;
  min-height: 100dvh;
  padding: 5.5rem clamp(1.15rem, 4vw, 3rem) 2.5rem;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Outfit', system-ui, sans-serif;
}

.page-inner {
  max-width: 720px;
  margin: 0 auto;
}

.page-head {
  margin-bottom: 1.5rem;
}

.identity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 12px;
}

.eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
}

.title {
  margin: 0;
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.6rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.lead {
  margin: 0.25rem 0 0;
  color: var(--ink-soft);
  font-size: 0.95rem;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--line);
  padding: clamp(1.15rem, 3vw, 1.75rem);
}

.panel-title {
  margin: 0 0 1.15rem;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 650;
}

.feedback {
  margin-bottom: 1rem;
  padding: 0.75rem 0.9rem;
  font-size: 0.9rem;
  border-left: 3px solid;
}

.feedback.error {
  background: #fef3f2;
  border-color: var(--err);
  color: var(--err);
}

.feedback.success {
  background: #ecfdf3;
  border-color: var(--ok);
  color: var(--ok);
}

.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field span {
  font-size: 0.82rem;
  font-weight: 650;
  color: var(--ink-soft);
}

.field input {
  height: 48px;
  padding: 0 0.9rem;
  border: 1px solid var(--line);
  background: #fff;
  font-family: inherit;
  font-size: 16px;
  color: var(--ink);
  outline: none;
}

.field input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(249, 92, 25, 0.15);
}

.field input:disabled {
  background: #efeae2;
  color: var(--ink-soft);
}

.submit-btn {
  grid-column: 1 / -1;
  height: 50px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 650;
  cursor: pointer;
  margin-top: 0.25rem;
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent-deep);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.state {
  padding: 2rem;
  color: var(--ink-soft);
}

@media (max-width: 640px) {
  .form {
    grid-template-columns: 1fr;
  }

  .identity {
    align-items: flex-start;
  }

  .avatar {
    width: 56px;
    height: 56px;
  }
}
</style>
