<script setup>
defineProps({
  hideClientLinks: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <footer class="site-footer" id="findUs">
    <div class="footer-inner">
      <div class="footer-brand">
        <p class="brand-tag">Plus proche de vous, plus proche de vos besoins.</p>
      </div>

      <nav v-if="!hideClientLinks" class="footer-nav" aria-label="Liens pied de page">
        <a href="#home">Accueil</a>
        <a href="#services">Services</a>
        <a href="#deliver_form">Commander</a>
      </nav>
    </div>

    <div class="footer-bar">
      <p>Tous droits réservés © Vantablvck, 2026</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  --paper: #f7f4ef;
  --accent: #f95c19;
  background: #0b1324;
  color: rgba(248, 244, 238, 0.78);
  font-family: 'Outfit', system-ui, sans-serif;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: clamp(2.25rem, 5vw, 3.25rem) clamp(1.15rem, 4vw, 3.5rem);
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem 2.5rem;
  align-items: flex-end;
  justify-content: space-between;
}

.brand-mark {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #fff;
  margin: 0 0 0.45rem;
  line-height: 1;
}

.brand-tag {
  margin: 0;
  max-width: 22rem;
  line-height: 1.5;
  font-size: 0.95rem;
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 1.35rem;
}

.footer-nav a {
  font-size: 0.92rem;
  font-weight: 550;
  color: rgba(248, 244, 238, 0.85);
  transition: color 0.2s ease;
}

.footer-nav a:hover {
  color: var(--accent);
}

.footer-bar {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem clamp(1.15rem, 4vw, 3.5rem);
  text-align: center;
}

.footer-bar p {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(248, 244, 238, 0.55);
}

@media (max-width: 600px) {
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
