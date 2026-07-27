<template>
  <section class="hero" id="home">
    <div class="hero-bg" aria-hidden="true"></div>
    <div class="hero-route" aria-hidden="true"></div>

    <div class="hero-inner">
      <div class="hero-copy">
        <p class="hero-brand">Quick.</p>
        <h1 class="hero-title">Livrer en toute confiance.</h1>
        <p class="hero-sub">De nos mains à votre porte, en toute sécurité.</p>
        <a class="hero-cta" href="#deliver_form">
          Passer commande
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <div class="hero-visual">
        <img
          src="@/assets/img/illustrations/hero.png"
          alt="Livraison Quick"
          class="hero-img"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');

.hero {
  --accent: #f95c19;
  position: relative;
  isolation: isolate;
  min-height: calc(100svh - 72px);
  display: flex;
  align-items: center;
  padding: clamp(5.5rem, 10vw, 7rem) clamp(1.15rem, 4vw, 3.5rem) clamp(2.5rem, 6vw, 4rem);
  overflow: hidden;
  color: #f8f4ee;
  background: #0b1324;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    radial-gradient(ellipse 70% 55% at 15% 20%, rgba(249, 92, 25, 0.38), transparent 55%),
    radial-gradient(ellipse 55% 45% at 85% 75%, rgba(56, 98, 156, 0.28), transparent 50%),
    linear-gradient(155deg, #0b1324 0%, #152238 48%, #1c2b45 100%);
}

.hero-route {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    repeating-linear-gradient(
      -18deg,
      transparent 0,
      transparent 32px,
      rgba(255, 255, 255, 0.03) 32px,
      rgba(255, 255, 255, 0.03) 33px
    );
  mask-image: linear-gradient(to bottom, black 20%, transparent 90%);
  pointer-events: none;
}

.hero-inner {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(1.5rem, 4vw, 3.5rem);
  align-items: center;
}

.hero-copy {
  max-width: 32rem;
  animation: rise 0.7s ease both;
}

.hero-brand {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(2.8rem, 7vw, 4.4rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.95;
  margin: 0 0 1rem;
  color: #fff;
}

.hero-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.45rem, 3.2vw, 2.15rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 0.85rem;
  color: rgba(255, 255, 255, 0.94);
}

.hero-sub {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(1rem, 2vw, 1.15rem);
  line-height: 1.55;
  color: rgba(248, 244, 238, 0.72);
  margin: 0 0 1.75rem;
  max-width: 26rem;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 1.35rem;
  background: var(--accent);
  color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 650;
  border: none;
  transition: background 0.2s ease, transform 0.15s ease;
}

.hero-cta:hover {
  background: #d9480f;
  transform: translateY(-1px);
  color: #fff;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  animation: rise 0.75s ease 0.1s both;
}

.hero-img {
  width: min(100%, 520px);
  filter: drop-shadow(0 24px 40px rgba(0, 0, 0, 0.35));
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 900px) {
  .hero {
    min-height: auto;
    padding-top: 5.5rem;
    padding-bottom: 2.5rem;
  }

  .hero-inner {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-copy {
    max-width: none;
    margin: 0 auto;
    order: 1;
  }

  .hero-sub {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-visual {
    order: 0;
  }

  .hero-img {
    width: min(78%, 340px);
  }
}

@media (max-width: 480px) {
  .hero-brand {
    font-size: 2.4rem;
  }

  .hero-title {
    font-size: 1.25rem;
  }

  .hero-cta {
    width: 100%;
    justify-content: center;
  }
}
</style>
