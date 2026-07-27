<template>
  <header class="site-nav" :class="{ open: menuOpen, scrolled: isScrolled }">
    <div class="nav-inner">
      <router-link class="nav-brand" to="/home" @click="closeMenu">
        <img src="@/assets/img/gallery/logo.png" alt="" class="nav-logo" />
        <span class="nav-wordmark">Quick<span>.</span></span>
      </router-link>

      <button
        class="nav-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="site-nav-menu"
        :aria-label="menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
        @click="menuOpen = !menuOpen"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div
        class="nav-backdrop"
        :class="{ show: menuOpen }"
        aria-hidden="true"
        @click="closeMenu"
      ></div>

      <nav id="site-nav-menu" class="nav-menu" :class="{ show: menuOpen }">
        <div class="nav-links">
          <router-link
            v-for="link in visibleLinks"
            :key="link.to.path + (link.to.hash || '') + link.label"
            class="nav-link"
            :to="link.to"
            @click="closeMenu"
          >
            {{ link.label }}
          </router-link>
        </div>

        <div class="nav-actions">
          <router-link class="user-chip" :to="{ path: '/profile' }" @click="closeMenu">
            <span class="user-avatar">{{ avatarLetter }}</span>
            <span class="user-meta">
              <strong>{{ displayName }}</strong>
              <small>{{ roleLabel }}</small>
            </span>
          </router-link>

          <button type="button" class="btn-logout" @click="handleLogout" aria-label="Déconnexion">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span class="logout-label">Déconnexion</span>
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isDeliverer = ref(false)
const isClient = ref(false)
const isAdmin = ref(false)
const username = ref('')
const menuOpen = ref(false)
const isScrolled = ref(false)

const roleLabel = computed(() => {
  if (isAdmin.value) return 'Administrateur'
  if (isDeliverer.value) return 'Livreur'
  if (isClient.value) return 'Client'
  return 'Utilisateur'
})

const displayName = computed(() => username.value || 'Mon profil')
const avatarLetter = computed(() => (username.value || '?').charAt(0).toUpperCase())

const visibleLinks = computed(() => {
  const links = [
    { label: 'Accueil', to: { path: '/home' } },
    { label: 'Services', to: { path: '/home', hash: '#services' } },
    { label: 'Commander', to: { path: '/home', hash: '#deliver_form' } },
  ]

  if (isClient.value) {
    links.push({ label: 'Mes commandes', to: { path: '/orders' } })
  }
  if (isDeliverer.value) {
    links.push({ label: 'Mes livraisons', to: { path: '/deliveries' } })
  }
  if (isAdmin.value) {
    links.push({ label: 'Administration', to: { path: '/admin' } })
  }

  links.push({ label: 'Livreurs', to: { path: '/deliverer' } })
  return links
})

const closeMenu = () => {
  menuOpen.value = false
}

const handleLogout = () => {
  localStorage.clear()
  sessionStorage.clear()
  closeMenu()
  router.push('/')
}

const onScroll = () => {
  isScrolled.value = window.scrollY > 8
}

const onKeydown = (event) => {
  if (event.key === 'Escape') closeMenu()
}

const onResize = () => {
  if (window.innerWidth > 992) closeMenu()
}

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

watch(
  () => route.fullPath,
  () => closeMenu()
)

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)
  onScroll()

  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      username.value = user.username || ''
      isDeliverer.value = user.role === 'livreur'
      isClient.value = user.role === 'client'
      isAdmin.value = user.role === 'admin'
    } catch (error) {
      console.error('Erreur parsing user data:', error)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.site-nav {
  --ink: #101828;
  --ink-soft: #475467;
  --accent: #f95c19;
  --accent-deep: #d9480f;
  --line: #e4e0d8;
  --paper: #f7f4ef;
  --navy: #0b1324;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1040;
  background: rgba(247, 244, 239, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid transparent;
  transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  font-family: 'Outfit', system-ui, sans-serif;
}

.site-nav.scrolled,
.site-nav.open {
  background: rgba(247, 244, 239, 0.97);
  border-bottom-color: var(--line);
  box-shadow: 0 10px 30px rgba(16, 24, 40, 0.07);
}

.nav-inner {
  position: relative;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0.75rem clamp(1rem, 3vw, 2rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 68px;
}

.nav-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
  z-index: 2;
  color: var(--ink);
}

.nav-logo {
  display: block;
  height: 36px;
  width: auto;
}

.nav-wordmark {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}

.nav-wordmark span {
  color: var(--accent);
}

.nav-toggle {
  display: none;
  position: relative;
  z-index: 2;
  width: 44px;
  height: 44px;
  border: 1px solid var(--line);
  background: #fff;
  padding: 0;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.nav-toggle:hover {
  border-color: var(--accent);
}

.nav-toggle span {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--ink);
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.site-nav.open .nav-toggle span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.site-nav.open .nav-toggle span:nth-child(2) {
  opacity: 0;
}

.site-nav.open .nav-toggle span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.nav-backdrop {
  display: none;
}

.nav-menu {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  gap: 1rem;
  min-width: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.1rem;
}

.nav-link {
  position: relative;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 550;
  color: var(--ink-soft);
  transition: color 0.2s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: 0.2rem;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.22s ease;
}

.nav-link:hover {
  color: var(--ink);
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  transform: scaleX(1);
}

.nav-link.router-link-active {
  color: var(--ink);
  font-weight: 650;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding-left: 0.85rem;
  border-left: 1px solid var(--line);
  flex-shrink: 0;
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  max-width: 180px;
  padding: 0.25rem 0.65rem 0.25rem 0.25rem;
  background: #fff;
  border: 1px solid var(--line);
  color: var(--ink);
  transition: border-color 0.2s ease, transform 0.15s ease;
}

.user-chip:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.user-avatar {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
}

.user-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.15;
}

.user-meta strong {
  font-size: 0.82rem;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-meta small {
  font-size: 0.7rem;
  color: var(--ink-soft);
  font-weight: 500;
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  height: 40px;
  min-width: 40px;
  padding: 0 0.75rem;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 650;
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.btn-logout:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(249, 92, 25, 0.06);
}

.logout-label {
  display: none;
}

@media (max-width: 1100px) {
  .nav-wordmark {
    font-size: 1.25rem;
  }

  .nav-link {
    padding: 0.45rem 0.55rem;
    font-size: 0.85rem;
  }

  .user-meta {
    display: none;
  }

  .user-chip {
    padding: 0.2rem;
    max-width: none;
  }
}

@media (max-width: 992px) {
  .nav-toggle {
    display: inline-flex;
  }

  .nav-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(11, 19, 36, 0.35);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
    z-index: 0;
  }

  .nav-backdrop.show {
    opacity: 1;
    pointer-events: auto;
  }

  .nav-menu {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(86vw, 340px);
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 0;
    padding: 5.25rem 1.25rem 1.5rem;
    background: var(--paper);
    border-left: 1px solid var(--line);
    box-shadow: -18px 0 40px rgba(16, 24, 40, 0.12);
    transform: translateX(104%);
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    z-index: 1;
    overflow-y: auto;
  }

  .nav-menu.show {
    transform: translateX(0);
  }

  .nav-links {
    flex-direction: column;
    align-items: stretch;
    gap: 0.15rem;
  }

  .nav-link {
    padding: 0.9rem 0.35rem;
    font-size: 1rem;
    border-bottom: 1px solid var(--line);
  }

  .nav-link::after {
    display: none;
  }

  .nav-link.router-link-active {
    color: var(--accent);
  }

  .nav-actions {
    margin-top: auto;
    padding: 1.25rem 0 0;
    border-left: none;
    border-top: 1px solid var(--line);
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
  }

  .user-chip {
    max-width: none;
    width: 100%;
    padding: 0.45rem 0.75rem 0.45rem 0.45rem;
  }

  .user-meta {
    display: flex;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .user-meta strong {
    font-size: 0.95rem;
  }

  .user-meta small {
    font-size: 0.78rem;
  }

  .btn-logout {
    width: 100%;
    height: 46px;
  }

  .logout-label {
    display: inline;
  }
}

@media (max-width: 420px) {
  .nav-logo {
    height: 30px;
  }

  .nav-wordmark {
    font-size: 1.15rem;
  }
}
</style>
