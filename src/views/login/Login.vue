<template>
  <div class="auth-page">
    <aside class="auth-brand" aria-hidden="false">
      <div class="brand-glow"></div>
      <div class="brand-route"></div>
      <div class="brand-content">
        <p class="brand-mark">Quick.</p>
        <h1 class="brand-title">De nos mains<br />à votre porte.</h1>
        <p class="brand-sub">Livraisons et récupérations simples, rapides, fiables.</p>
      </div>
      <ul class="brand-points">
        <li>Suivi en temps réel</li>
        <li>Livreurs à proximité</li>
        <li>Commande en quelques clics</li>
      </ul>
    </aside>

    <div class="auth-panel">
      <div class="auth-panel-inner">
        <header class="auth-header">
          <p class="auth-kicker">{{ isLogin ? 'Bon retour' : 'Créer un compte' }}</p>
          <h2 class="auth-heading">{{ isLogin ? 'Connexion' : 'Inscription' }}</h2>
        </header>

        <div class="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            class="auth-tab"
            :class="{ active: isLogin }"
            :aria-selected="isLogin"
            @click="isLogin = true"
          >
            Connexion
          </button>
          <button
            type="button"
            role="tab"
            class="auth-tab"
            :class="{ active: !isLogin }"
            :aria-selected="!isLogin"
            @click="isLogin = false"
          >
            Inscription
          </button>
          <span class="auth-tab-indicator" :class="{ right: !isLogin }"></span>
        </div>

        <p v-if="feedback" class="auth-feedback" :class="feedbackType">{{ feedback }}</p>

        <Transition name="auth-fade" mode="out-in">
          <form
            v-if="isLogin"
            key="login"
            class="auth-form"
            @submit.prevent="handleLogin"
          >
            <label class="field">
              <span>Nom d'utilisateur</span>
              <input
                v-model="loginForm.username"
                type="text"
                autocomplete="username"
                placeholder="ex. jean.dupont"
                required
              />
            </label>

            <label class="field">
              <span>Mot de passe</span>
              <input
                v-model="loginForm.password"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••"
                required
              />
            </label>

            <div class="field-meta">
              <a href="#" class="pass-link" @click.prevent>Mot de passe oublié ?</a>
            </div>

            <button class="submit-btn" type="submit" :disabled="loading">
              <span v-if="!loading">Se connecter</span>
              <span v-else class="spinner" aria-hidden="true"></span>
            </button>
          </form>

          <form
            v-else
            key="signup"
            class="auth-form"
            @submit.prevent="handleSignup"
          >
            <label class="field">
              <span>Nom d'utilisateur</span>
              <input
                v-model="signupForm.username"
                type="text"
                autocomplete="username"
                placeholder="Choisissez un identifiant"
                required
              />
            </label>

            <label class="field">
              <span>Mot de passe</span>
              <input
                v-model="signupForm.password"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
                required
              />
            </label>

            <label class="field">
              <span>Confirmer le mot de passe</span>
              <input
                v-model="signupForm.confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
                required
              />
            </label>

            <label class="field">
              <span>Rôle</span>
              <select v-model="signupForm.role" required>
                <option disabled value="">Choisir un rôle</option>
                <option value="client">Client</option>
                <option value="livreur">Livreur</option>
              </select>
            </label>

            <button class="submit-btn" type="submit" :disabled="loading">
              <span v-if="!loading">Créer mon compte</span>
              <span v-else class="spinner" aria-hidden="true"></span>
            </button>
          </form>
        </Transition>

        <p class="auth-switch">
          <template v-if="isLogin">
            Pas encore de compte ?
            <button type="button" class="link-btn" @click="isLogin = false">S'inscrire</button>
          </template>
          <template v-else>
            Déjà inscrit ?
            <button type="button" class="link-btn" @click="isLogin = true">Se connecter</button>
          </template>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const isLogin = ref(true)
const loading = ref(false)
const feedback = ref('')
const feedbackType = ref('error')

const loginForm = ref({
  username: '',
  password: '',
})

const signupForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  role: '',
})

const handleLogin = async () => {
  loading.value = true
  feedback.value = ''
  try {
    const response = await api.post('auth/login/', loginForm.value)

    localStorage.setItem('access', response.data.access)
    localStorage.setItem('refresh', response.data.refresh)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    router.push('/home')
  } catch (error) {
    feedbackType.value = 'error'
    feedback.value =
      error.response?.data?.non_field_errors?.[0] ||
      error.response?.data?.detail ||
      'Identifiants invalides. Vérifiez votre nom d’utilisateur et mot de passe.'
    loading.value = false
  }
}

const handleSignup = async () => {
  const { username, password, confirmPassword, role } = signupForm.value

  if (password !== confirmPassword) {
    feedbackType.value = 'error'
    feedback.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  loading.value = true
  feedback.value = ''
  try {
    await api.post('auth/register/', {
      username,
      password,
      role,
    })
    isLogin.value = true
    loginForm.value.username = username
    signupForm.value = { username: '', password: '', confirmPassword: '', role: '' }
    feedbackType.value = 'success'
    feedback.value = 'Compte créé. Vous pouvez vous connecter.'
    loading.value = false
  } catch (error) {
    const data = error.response?.data
    let message = 'Impossible de créer le compte.'
    if (data && typeof data === 'object') {
      const first = Object.values(data).flat?.()[0] || Object.values(data)[0]
      if (typeof first === 'string') message = first
      else if (Array.isArray(first)) message = first[0]
    }
    feedbackType.value = 'error'
    feedback.value = message
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');

.auth-page {
  --ink: #101828;
  --ink-soft: #475467;
  --paper: #f7f4ef;
  --panel: #ffffff;
  --accent: #f95c19;
  --accent-deep: #d9480f;
  --line: #e4e0d8;
  --ok: #0f7b4c;
  --err: #b42318;

  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  max-width: 100%;
  flex: 1;
  font-family: 'Outfit', sans-serif;
  color: var(--ink);
  background: var(--paper);
  overflow-x: hidden;
  box-sizing: border-box;
}

.auth-page *,
.auth-page *::before,
.auth-page *::after {
  box-sizing: border-box;
}

.auth-brand {
  position: relative;
  overflow: hidden;
  padding: clamp(1.5rem, 5vw, 4rem);
  padding-top: max(clamp(1.5rem, 5vw, 4rem), env(safe-area-inset-top));
  padding-left: max(clamp(1.5rem, 5vw, 4rem), env(safe-area-inset-left));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  min-width: 0;
  color: #f8f4ee;
  background:
    radial-gradient(ellipse 80% 60% at 20% 20%, rgba(249, 92, 25, 0.35), transparent 55%),
    radial-gradient(ellipse 70% 50% at 80% 80%, rgba(56, 98, 156, 0.25), transparent 50%),
    linear-gradient(155deg, #0b1324 0%, #152238 48%, #1c2b45 100%) !important;
  animation: brand-in 0.7s ease both;
}

.brand-glow {
  position: absolute;
  inset: auto -20% -30% auto;
  width: 55%;
  height: 55%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(249, 92, 25, 0.28), transparent 70%);
  filter: blur(8px);
  pointer-events: none;
}

.brand-route {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.04) 40.5%, transparent 41%),
    repeating-linear-gradient(
      -18deg,
      transparent 0,
      transparent 28px,
      rgba(255, 255, 255, 0.03) 28px,
      rgba(255, 255, 255, 0.03) 29px
    );
  pointer-events: none;
  mask-image: linear-gradient(to bottom, black 30%, transparent 95%);
}

.brand-content {
  position: relative;
  z-index: 1;
  max-width: 28rem;
  margin-top: 2rem;
}

.brand-mark {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(2.6rem, 5vw, 3.8rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 1.25rem;
  color: #fff;
}

.brand-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.6rem, 3.2vw, 2.35rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 0.9rem;
  color: rgba(255, 255, 255, 0.95);
}

.brand-sub {
  font-size: 1.05rem;
  line-height: 1.55;
  color: rgba(248, 244, 238, 0.72);
  max-width: 22rem;
}

.brand-points {
  position: relative;
  z-index: 1;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  padding: 0;
  margin: 2.5rem 0 0;
}

.brand-points li {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.45rem 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(6px);
}

.auth-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  width: 100%;
  padding: clamp(1.25rem, 4vw, 3rem);
  padding-bottom: max(clamp(1.25rem, 4vw, 3rem), env(safe-area-inset-bottom));
  padding-right: max(clamp(1.25rem, 4vw, 3rem), env(safe-area-inset-right));
  background:
    radial-gradient(circle at 100% 0%, rgba(249, 92, 25, 0.07), transparent 40%),
    var(--paper) !important;
  animation: panel-in 0.65s ease 0.08s both;
}

.auth-panel-inner {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.auth-header {
  margin-bottom: 1.5rem;
}

.auth-kicker {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.4rem;
}

.auth-heading {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.7rem, 3vw, 2.1rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.auth-tabs {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  padding: 0.3rem;
  margin-bottom: 1.5rem;
  background: #efeae2;
}

.auth-tab {
  position: relative;
  z-index: 1;
  border: none;
  background: transparent;
  padding: 0.7rem 0.5rem;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink-soft);
  cursor: pointer;
  transition: color 0.25s ease;
}

.auth-tab.active {
  color: var(--ink);
}

.auth-tab-indicator {
  position: absolute;
  top: 0.3rem;
  bottom: 0.3rem;
  left: 0.3rem;
  width: calc(50% - 0.3rem);
  background: var(--panel);
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.08);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.auth-tab-indicator.right {
  transform: translateX(100%);
}

.auth-feedback {
  margin-bottom: 1rem;
  padding: 0.75rem 0.9rem;
  font-size: 0.9rem;
  line-height: 1.4;
  border-left: 3px solid;
  animation: feedback-in 0.3s ease both;
}

.auth-feedback.error {
  background: #fef3f2;
  border-color: var(--err);
  color: var(--err);
}

.auth-feedback.success {
  background: #ecfdf3;
  border-color: var(--ok);
  color: var(--ok);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field span {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink-soft);
}

.field input,
.field select {
  width: 100%;
  max-width: 100%;
  height: 48px;
  padding: 0 0.95rem;
  border: 1px solid var(--line);
  border-radius: 0;
  background: var(--panel);
  font-family: inherit;
  font-size: 16px; /* évite le zoom iOS */
  color: var(--ink);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  -webkit-appearance: none;
  appearance: none;
}

.field input::placeholder {
  color: #98a2b3;
}

.field input:focus,
.field select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(249, 92, 25, 0.15);
}

.field select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23475467' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.9rem center;
  padding-right: 2.2rem;
}

.field-meta {
  display: flex;
  justify-content: flex-end;
  margin-top: -0.35rem;
}

.pass-link,
.link-btn {
  border: none;
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;
  cursor: pointer;
}

.pass-link:hover,
.link-btn:hover {
  color: var(--accent-deep);
  text-decoration: underline;
}

.submit-btn {
  margin-top: 0.35rem;
  width: 100%;
  height: 50px;
  min-height: 48px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 650;
  letter-spacing: 0.01em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.15s ease;
  touch-action: manipulation;
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent-deep);
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 1.15rem;
  height: 1.15rem;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.auth-switch {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.92rem;
  color: var(--ink-soft);
}

.auth-fade-enter-active,
.auth-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.auth-fade-enter-from,
.auth-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@keyframes brand-in {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes feedback-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Tablette paysage / petits laptops */
@media (max-width: 1100px) {
  .auth-page {
    grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1fr);
  }

  .brand-points li {
    font-size: 0.8rem;
  }
}

/* Tablette portrait & mobile : stack vertical */
@media (max-width: 900px) {
  .auth-page {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .auth-brand {
    min-height: unset;
    padding: 1.35rem 1.25rem 1.25rem;
    padding-top: max(1.35rem, env(safe-area-inset-top));
    gap: 0.75rem;
    justify-content: flex-start;
  }

  .brand-content {
    margin-top: 0;
    max-width: none;
  }

  .brand-mark {
    font-size: clamp(1.9rem, 8vw, 2.4rem);
    margin-bottom: 0.55rem;
  }

  .brand-title {
    font-size: clamp(1.15rem, 4.5vw, 1.45rem);
    margin-bottom: 0.4rem;
  }

  .brand-title br {
    display: none;
  }

  .brand-sub {
    font-size: 0.92rem;
    max-width: none;
    line-height: 1.45;
  }

  .brand-points {
    display: none;
  }

  .auth-panel {
    padding: 1.5rem 1.15rem 2rem;
    padding-bottom: max(2rem, env(safe-area-inset-bottom));
    align-items: flex-start;
  }

  .auth-header {
    margin-bottom: 1.15rem;
  }

  .auth-tabs {
    margin-bottom: 1.15rem;
  }
}

/* Petits téléphones */
@media (max-width: 480px) {
  .auth-brand {
    padding: 1.1rem 1rem 1rem;
  }

  .brand-mark {
    font-size: 1.75rem;
    margin-bottom: 0.4rem;
  }

  .brand-title {
    font-size: 1.1rem;
  }

  .brand-sub {
    font-size: 0.85rem;
  }

  .auth-panel {
    padding: 1.25rem 0.95rem 1.75rem;
  }

  .auth-heading {
    font-size: 1.45rem;
  }

  .auth-kicker {
    font-size: 0.72rem;
  }

  .auth-tab {
    padding: 0.65rem 0.35rem;
    font-size: 0.88rem;
  }

  .field input,
  .field select {
    height: 46px;
  }

  .submit-btn {
    height: 48px;
  }

  .auth-switch {
    font-size: 0.88rem;
    margin-top: 1.25rem;
  }
}

/* Très petits écrans / landscape court */
@media (max-height: 700px) and (max-width: 900px) {
  .auth-brand {
    padding-top: 0.9rem;
    padding-bottom: 0.85rem;
  }

  .brand-sub {
    display: none;
  }

  .auth-panel {
    padding-top: 1rem;
  }

  .auth-form {
    gap: 0.75rem;
  }
}

/* Landscape mobile : 2 colonnes compactes si assez large */
@media (max-height: 500px) and (orientation: landscape) and (min-width: 640px) {
  .auth-page {
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    grid-template-rows: 1fr;
    min-height: 100vh;
    min-height: 100dvh;
  }

  .auth-brand {
    padding: 1rem 1.25rem;
    justify-content: center;
  }

  .brand-title,
  .brand-sub,
  .brand-points {
    display: none;
  }

  .brand-mark {
    margin: 0;
    font-size: 2rem;
  }

  .auth-panel {
    align-items: center;
    padding: 1rem 1.25rem;
    overflow-y: auto;
  }

  .auth-form {
    gap: 0.65rem;
  }

  .field input,
  .field select,
  .submit-btn {
    height: 42px;
  }
}
</style>
