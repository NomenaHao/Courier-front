<template>
  <div class="admin-shell">
    <div class="admin-inner">
      <header class="admin-top">
        <div>
          <p class="eyebrow">Administration</p>
          <h1 class="title">Quick — Console</h1>
        </div>
        <nav class="admin-nav" aria-label="Sections admin">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            :class="{ active: isNavActive(item.to) }"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </header>

      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Commandes', to: '/admin/orders' },
  { label: 'Utilisateurs', to: '/admin/users' },
  { label: 'Livreurs', to: '/admin/deliverers' },
]

function isNavActive(to) {
  if (to === '/admin') {
    return route.path === '/admin' || route.path === '/admin/'
  }
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<style scoped>
.admin-shell {
  --ink: #101828;
  --ink-soft: #475467;
  --paper: #f7f4ef;
  --panel: #ffffff;
  --accent: #f95c19;
  --accent-deep: #d9480f;
  --line: #e4e0d8;
  --navy: #0b1324;

  min-height: 100vh;
  min-height: 100dvh;
  padding: 5.25rem clamp(1rem, 3vw, 2rem) 2rem;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Outfit', system-ui, sans-serif;
}

.admin-inner {
  max-width: 1280px;
  margin: 0 auto;
}

.admin-top {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem 1.5rem;
  margin-bottom: 1.25rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
}

.title {
  margin: 0;
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.admin-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.3rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 10px;
}

.nav-link {
  padding: 0.5rem 0.85rem;
  font-size: 0.88rem;
  font-weight: 650;
  color: var(--ink-soft);
  text-decoration: none;
  border-radius: 7px;
  transition: background 0.2s ease, color 0.2s ease;
}

.nav-link:hover {
  color: var(--ink);
  background: rgba(249, 92, 25, 0.08);
}

.nav-link.active {
  background: var(--accent);
  color: #fff;
}

@media (max-width: 640px) {
  .admin-top {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-nav {
    width: 100%;
    justify-content: stretch;
  }

  .nav-link {
    flex: 1 1 auto;
    text-align: center;
  }
}
</style>
