<template>
  <section class="services" id="services">
    <div class="services-inner">
      <header class="services-head">
        <p class="eyebrow">Services</p>
        <h2 class="title">Ce que Quick fait pour vous</h2>
        <p class="lead">Trois façons d’envoyer, récupérer ou livrer — simplement.</p>
      </header>

      <div class="services-list">
        <article
          v-for="(item, index) in items"
          :key="item.title"
          class="service-row"
          :class="{ featured: item.featured }"
        >
          <span class="service-index">0{{ index + 1 }}</span>
          <div class="service-body">
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
            <ul>
              <li v-for="point in item.points" :key="point">{{ point }}</li>
            </ul>
          </div>
          <a class="service-link" href="#deliver_form">Commander</a>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
const items = [
  {
    title: 'Livraison entreprise',
    text: 'Colis professionnels livrés à domicile ou au bureau, sous 48 à 72 heures.',
    points: ['Marchandises corporate', 'Expéditions', 'Accessoires'],
    featured: false,
  },
  {
    title: 'Livraison locale',
    text: 'Couverture urbaine et périurbaine pour vos envois du quotidien.',
    points: ['Suivi en direct', 'Livreurs à proximité', 'Créneaux flexibles'],
    featured: true,
  },
  {
    title: 'Documents sensibles',
    text: 'Remise soignée de documents importants, rapidement et en sécurité.',
    points: ['Traçabilité', 'Remise en main propre', 'Priorité express'],
    featured: false,
  },
]
</script>

<style scoped>
.services {
  --ink: #101828;
  --ink-soft: #475467;
  --paper: #f7f4ef;
  --accent: #f95c19;
  --line: #e4e0d8;

  padding: clamp(3.5rem, 8vw, 6rem) clamp(1.15rem, 4vw, 3.5rem);
  background: var(--paper);
  color: var(--ink);
  font-family: 'Outfit', system-ui, sans-serif;
}

.services-inner {
  max-width: 1080px;
  margin: 0 auto;
}

.services-head {
  max-width: 36rem;
  margin-bottom: clamp(2rem, 5vw, 3rem);
}

.eyebrow {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 0.55rem;
}

.title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.7rem, 3.5vw, 2.4rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 0.65rem;
}

.lead {
  margin: 0;
  color: var(--ink-soft);
  font-size: 1.05rem;
  line-height: 1.5;
}

.services-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--line);
}

.service-row {
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: start;
  padding: clamp(1.35rem, 3vw, 1.85rem) 0;
  border-bottom: 1px solid var(--line);
  transition: background 0.2s ease;
}

.service-row.featured {
  background: linear-gradient(90deg, rgba(249, 92, 25, 0.06), transparent 55%);
}

.service-index {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--accent);
  padding-top: 0.15rem;
}

.service-body h3 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.2rem, 2.4vw, 1.45rem);
  font-weight: 650;
  margin: 0 0 0.45rem;
  letter-spacing: -0.015em;
}

.service-body p {
  margin: 0 0 0.75rem;
  color: var(--ink-soft);
  line-height: 1.5;
  max-width: 36rem;
}

.service-body ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem 0.85rem;
}

.service-body li {
  font-size: 0.88rem;
  font-weight: 550;
  color: var(--ink);
}

.service-body li::before {
  content: '·';
  margin-right: 0.4rem;
  color: var(--accent);
  font-weight: 700;
}

.service-link {
  align-self: center;
  font-size: 0.9rem;
  font-weight: 650;
  color: var(--accent);
  white-space: nowrap;
  padding: 0.45rem 0;
  transition: color 0.2s ease;
}

.service-link:hover {
  color: #d9480f;
}

@media (max-width: 720px) {
  .service-row {
    grid-template-columns: 3rem minmax(0, 1fr);
    gap: 0.75rem 1rem;
  }

  .service-link {
    grid-column: 2;
    align-self: start;
  }
}

@media (max-width: 480px) {
  .services-head {
    text-align: left;
  }

  .service-body ul {
    flex-direction: column;
    gap: 0.3rem;
  }
}
</style>
