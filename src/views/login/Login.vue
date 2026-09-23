<template>
  <div class="auth-page">
    <aside class="auth-hero" aria-hidden="false">
      <div class="hero-media" role="presentation"></div>
      <div class="hero-shade"></div>
      <div class="hero-copy">
        <h1 class="hero-title">
          De nos mains<br />
          <span class="hero-highlight">à votre porte.</span>
        </h1>
        <p class="hero-sub">Livraisons et récupérations simples, rapides, fiables.</p>
      </div>
    </aside>

    <div class="auth-shell">
      <div class="auth-card">
        <header class="auth-brand-row">
          <img
            v-if="logoOk"
            src="@/assets/img/gallery/logo.png"
            alt=""
            class="brand-logo"
            @error="logoOk = false"
          />
          <span v-else class="brand-wordmark">Quick<span class="dot">.</span></span>
        </header>

        <header class="auth-header">
          <p class="auth-kicker">{{ isLogin ? 'Bon retour' : 'Créer un compte' }}</p>
          <h2 class="auth-heading">{{ isLogin ? 'Connexion' : 'Inscription' }}</h2>
        </header>

        <div class="feature-carousel" aria-live="polite">
          <div class="carousel-visual">
            <img :src="slides[activeSlide].icon" alt="" class="carousel-icon" />
          </div>
          <!-- <p class="carousel-caption">{{ slides[activeSlide].text }}</p> -->
          <div class="carousel-dots" role="tablist" aria-label="Points forts">
            <button
              v-for="(slide, index) in slides"
              :key="slide.text"
              type="button"
              class="dot-btn"
              :class="{ active: activeSlide === index }"
              :aria-selected="activeSlide === index"
              @click="activeSlide = index"
            />
          </div>
        </div>

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
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useWebSocket } from '@/composables/useWebSocket'
import iconTrack from '@/assets/img/icons/services-1.svg'
import iconNearby from '@/assets/img/icons/services-2.svg'
import iconOrder from '@/assets/img/icons/services-3.svg'

const router = useRouter()
const { connect, disconnect } = useWebSocket()

const isLogin = ref(true)
const loading = ref(false)
const feedback = ref('')
const feedbackType = ref('error')
const logoOk = ref(true)
const activeSlide = ref(0)

const slides = [
  { text: 'Suivi en temps réel', icon: iconTrack },
  { text: 'Livreurs à proximité', icon: iconNearby },
  { text: 'Commande en quelques clics', icon: iconOrder },
]

let carouselTimer = null

onMounted(() => {
  carouselTimer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.length
  }, 4500)
})

onUnmounted(() => {
  if (carouselTimer) clearInterval(carouselTimer)
})

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

    disconnect()
    connect()
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
  --panel: #ffffff;
  --accent: #ef3b2d;
  --accent-deep: #d62828;
  --line: #e4e7ec;
  --ok: #0f7b4c;
  --err: #b42318;

  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  font-family: 'Outfit', sans-serif;
  color: var(--ink);
  background: #1a1a1a;
  overflow-x: hidden;
}

.auth-page *,
.auth-page *::before,
.auth-page *::after {
  box-sizing: border-box;
}

.auth-hero {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
}

.hero-media {
  position: absolute;
  inset: 0;
  background: url('/assets/img/Deliverer.jpg') center / cover no-repeat;
  transform: scale(1.03);
}

.hero-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.55) 0%,
    rgba(0, 0, 0, 0.25) 55%,
    rgba(0, 0, 0, 0.45) 100%
  );
}

.hero-copy {
  position: absolute;
  left: clamp(1.5rem, 4vw, 3rem);
  bottom: clamp(2rem, 6vw, 4rem);
  z-index: 1;
  max-width: 28rem;
  color: #fff;
}

.hero-title {
  margin: 0 0 0.75rem;
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.02em;
}

.hero-highlight {
  color: var(--accent);
}

.hero-sub {
  margin: 0;
  font-size: clamp(0.95rem, 1.5vw, 1.05rem);
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.82);
  max-width: 22rem;
}

.auth-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 3vw, 2rem);
  background:
    linear-gradient(180deg, rgba(30, 30, 30, 0.92), rgba(20, 20, 20, 0.96)),
    url('/assets/img/Deliverer.jpg') center / cover no-repeat;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: clamp(1.35rem, 3vw, 2rem) clamp(1.25rem, 3vw, 1.75rem);
  background: var(--panel);
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  animation: panel-in 0.55s ease both;
}

.auth-brand-row {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.brand-logo {
  height: 42px;
  width: auto;
  object-fit: contain;
}

.brand-wordmark {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.65rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--ink);
}

.brand-wordmark .dot {
  color: var(--accent);
}

.auth-header {
  text-align: center;
  margin-bottom: 0.85rem;
}

.auth-kicker {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 0.25rem;
}

.auth-heading {
  margin: 0;
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.45rem, 2.5vw, 1.85rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.feature-carousel {
  text-align: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
}

.carousel-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 72px;
  margin-bottom: 0.35rem;
}

.carousel-icon {
  height: 56px;
  width: auto;
}

.carousel-caption {
  margin: 0 0 0.55rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink-soft);
  line-height: 1.35;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 0.35rem;
}

.dot-btn {
  width: 7px;
  height: 7px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #d0d5dd;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.dot-btn.active {
  background: var(--accent);
  transform: scale(1.15);
}

.auth-tabs {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  padding: 0.28rem;
  margin-bottom: 1rem;
  background: #f2f4f7;
  border-radius: 10px;
}

.auth-tab {
  position: relative;
  z-index: 1;
  border: none;
  background: transparent;
  padding: 0.62rem 0.5rem;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink-soft);
  cursor: pointer;
  border-radius: 8px;
  transition: color 0.25s ease;
}

.auth-tab.active {
  color: var(--ink);
}

.auth-tab-indicator {
  position: absolute;
  top: 0.28rem;
  bottom: 0.28rem;
  left: 0.28rem;
  width: calc(50% - 0.28rem);
  background: var(--panel);
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(16, 24, 40, 0.1);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.auth-tab-indicator.right {
  transform: translateX(100%);
}

.auth-feedback {
  margin-bottom: 0.85rem;
  padding: 0.7rem 0.85rem;
  font-size: 0.88rem;
  line-height: 1.4;
  border-radius: 8px;
  border-left: 3px solid;
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
  gap: 0.85rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field span {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-soft);
}

.field input,
.field select {
  width: 100%;
  height: 48px;
  padding: 0 0.95rem;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
  font-family: inherit;
  font-size: 16px;
  color: var(--ink);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input:focus,
.field select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(239, 59, 45, 0.14);
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
  margin-top: -0.25rem;
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
  cursor: pointer;
}

.pass-link:hover,
.link-btn:hover {
  color: var(--accent-deep);
  text-decoration: underline;
}

.submit-btn {
  margin-top: 0.25rem;
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 650;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.15s ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent-deep);
  transform: translateY(-1px);
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
  margin-top: 1.15rem;
  text-align: center;
  font-size: 0.9rem;
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

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(12px);
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

@media (max-width: 960px) {
  .auth-page {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(220px, 34vh) 1fr;
  }

  .auth-hero {
    min-height: unset;
  }

  .hero-copy {
    left: 1.15rem;
    right: 1.15rem;
    bottom: 1.15rem;
  }

  .hero-title {
    font-size: clamp(1.35rem, 5vw, 1.75rem);
  }

  .hero-sub {
    font-size: 0.88rem;
  }

  .auth-shell {
    align-items: flex-start;
    padding-top: 0.75rem;
  }

  .auth-card {
    margin-top: -1.5rem;
    position: relative;
    z-index: 2;
  }
}

@media (max-width: 480px) {
  .auth-card {
    border-radius: 12px;
    padding: 1.15rem 1rem 1.35rem;
  }

  .carousel-visual {
    height: 60px;
  }

  .carousel-icon {
    height: 48px;
  }
}
</style>
