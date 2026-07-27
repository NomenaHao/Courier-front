<template>
  <section class="order" id="deliver_form">
    <div class="order-inner">
      <aside class="order-intro">
        <p class="eyebrow">Commander</p>
        <h2 class="title">Envoyez ou faites récupérer</h2>
        <p class="lead">
          Remplissez le formulaire. Votre livreur et l’équipe sont notifiés en direct.
        </p>
        <img
          class="order-illu"
          src="@/assets/img/illustrations/callback.png"
          alt=""
        />
      </aside>

      <div class="order-panel">
        <div class="order-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            class="order-tab"
            :class="{ active: activeTab === 'livraison' }"
            :aria-selected="activeTab === 'livraison'"
            @click="activeTab = 'livraison'"
          >
            Livraison
          </button>
          <button
            type="button"
            role="tab"
            class="order-tab"
            :class="{ active: activeTab === 'recuperation' }"
            :aria-selected="activeTab === 'recuperation'"
            @click="activeTab = 'recuperation'"
          >
            Récupération
          </button>
          <span
            class="order-tab-indicator"
            :class="{ right: activeTab === 'recuperation' }"
          ></span>
        </div>

        <div
          v-if="feedback.message"
          class="order-feedback"
          :class="feedback.type === 'error' ? 'error' : 'success'"
        >
          {{ feedback.message }}
        </div>

        <form
          v-if="activeTab === 'livraison'"
          class="order-form"
          @submit.prevent="submitLivraison"
        >
          <label class="field">
            <span>Nom</span>
            <input v-model="livraison.name" type="text" placeholder="Votre nom" required />
          </label>

          <label class="field">
            <span>Email</span>
            <input v-model="livraison.email" type="email" placeholder="vous@email.com" required />
          </label>

          <label class="field">
            <span>Adresse de livraison</span>
            <input
              v-model="livraison.address"
              type="text"
              placeholder="Rue, quartier, ville"
              required
            />
          </label>

          <label class="field">
            <span>Livreur</span>
            <select v-model="livraison.courier" :disabled="loadingLivraison" required>
              <option value="">Sélectionnez un livreur</option>
              <option v-for="c in couriers" :key="c.id" :value="c.id">
                {{ c.username }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>Informations complémentaires</span>
            <textarea
              v-model="livraison.message"
              placeholder="Précisions sur le colis, horaires…"
              rows="4"
            ></textarea>
          </label>

          <button class="submit-btn" type="submit" :disabled="loadingLivraison">
            {{ loadingLivraison ? 'Envoi...' : 'Envoyer' }}
          </button>
        </form>

        <form
          v-else
          class="order-form"
          @submit.prevent="submitRecuperation"
        >
          <label class="field">
            <span>Nom</span>
            <input v-model="recuperation.name" type="text" placeholder="Votre nom" required />
          </label>

          <label class="field">
            <span>Téléphone</span>
            <input
              v-model="recuperation.phone"
              type="tel"
              placeholder="Ex. 034 00 000 00"
              required
            />
          </label>

          <label class="field">
            <span>Adresse de récupération</span>
            <input
              v-model="recuperation.pickupAddress"
              type="text"
              placeholder="Où récupérer le colis"
              required
            />
          </label>

          <label class="field">
            <span>Informations complémentaires</span>
            <textarea
              v-model="recuperation.message"
              placeholder="Précisions utiles…"
              rows="4"
            ></textarea>
          </label>

          <button class="submit-btn" type="submit" :disabled="loadingRecuperation">
            {{ loadingRecuperation ? 'Envoi...' : 'Demander récupération' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";

import api from "@/services/api";

const activeTab = ref("livraison");
const couriers = ref([]);

const loadingLivraison = ref(false);
const loadingRecuperation = ref(false);

const feedback = reactive({
  type: "success",
  message: "",
});

const livraison = reactive({
  name: "",
  email: "",
  address: "",
  courier: "",
  message: "",
});

const recuperation = reactive({
  name: "",
  phone: "",
  pickupAddress: "",
  message: "",
});

onMounted(async () => {
  try {
    const response = await api.get("auth/livreurs/");
    couriers.value = Array.isArray(response.data) ? response.data : [];
    if (couriers.value.length === 0) {
      console.warn("Aucun livreur trouvé");
      feedback.message = "Aucun livreur disponible pour le moment.";
    }
  } catch (error) {
    console.error("Erreur lors du chargement des livreurs:", error.response?.data || error.message);
    couriers.value = [];
    feedback.type = "error";
    feedback.message = "Impossible de charger la liste des livreurs.";
  }
});

function resetLivraison() {
  livraison.name = "";
  livraison.email = "";
  livraison.address = "";
  livraison.courier = "";
  livraison.message = "";
}

function resetRecuperation() {
  recuperation.name = "";
  recuperation.phone = "";
  recuperation.pickupAddress = "";
  recuperation.message = "";
}

function livraisonDescription() {
  const header = `Nom: ${livraison.name} | Email: ${livraison.email}`;
  return livraison.message ? `${header}\n${livraison.message}` : header;
}

function recuperationDescription() {
  const header = `Nom: ${recuperation.name} | Telephone: ${recuperation.phone}`;
  return recuperation.message ? `${header}\n${recuperation.message}` : header;
}

async function submitLivraison() {
  loadingLivraison.value = true;
  feedback.message = "";

  try {
    await api.post("orders/create/", {
      order_type: "livraison",
      delivery_location: {
        address: livraison.address,
      },
      description: livraisonDescription(),
      deliverer_id: Number(livraison.courier),
    });

    feedback.type = "success";
    feedback.message = "Livraison enregistree. Admin et livreur sont notifies en direct.";
    resetLivraison();
  } catch (error) {
    feedback.type = "error";
    const errorData = error?.response?.data;
    
    // Gestion des erreurs DRF
    if (typeof errorData === 'object' && !Array.isArray(errorData)) {
      const errors = Object.entries(errorData)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
        .join(' | ');
      feedback.message = errors || "Erreur lors de la creation de la livraison.";
    } else {
      feedback.message = error?.response?.data?.detail || "Erreur pendant la creation de la livraison.";
    }
    
    console.error("Livraison error:", errorData);
  } finally {
    loadingLivraison.value = false;
  }
}

async function submitRecuperation() {
  loadingRecuperation.value = true;
  feedback.message = "";

  try {
    await api.post("orders/create/", {
      order_type: "recuperation",
      pickup_location: {
        address: recuperation.pickupAddress,
      },
      description: recuperationDescription(),
    });

    feedback.type = "success";
    feedback.message = "Demande de recuperation enregistree et admin notifie.";
    resetRecuperation();
  } catch (error) {
    feedback.type = "error";
    const errorData = error?.response?.data;
    
    // Gestion des erreurs DRF
    if (typeof errorData === 'object' && !Array.isArray(errorData)) {
      const errors = Object.entries(errorData)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
        .join(' | ');
      feedback.message = errors || "Erreur lors de la creation de la recuperation.";
    } else {
      feedback.message = error?.response?.data?.detail || "Erreur pendant la creation de la recuperation.";
    }
    
    console.error("Recuperation error:", errorData);
  } finally {
    loadingRecuperation.value = false;
  }
}
</script>

<style scoped>
.order {
  --ink: #101828;
  --ink-soft: #475467;
  --paper: #f7f4ef;
  --panel: #ffffff;
  --accent: #f95c19;
  --accent-deep: #d9480f;
  --line: #e4e0d8;
  --ok: #0f7b4c;
  --err: #b42318;
  --navy: #0b1324;

  padding: clamp(3.5rem, 8vw, 6rem) clamp(1.15rem, 4vw, 3.5rem);
  background:
    radial-gradient(circle at 0% 0%, rgba(249, 92, 25, 0.08), transparent 40%),
    var(--paper);
  font-family: 'Outfit', system-ui, sans-serif;
  color: var(--ink);
}

.order-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: clamp(1.75rem, 4vw, 3.5rem);
  align-items: start;
}

.order-intro {
  position: sticky;
  top: 6rem;
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
  font-size: clamp(1.7rem, 3.2vw, 2.35rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 0.7rem;
  line-height: 1.15;
}

.lead {
  margin: 0 0 1.5rem;
  color: var(--ink-soft);
  line-height: 1.55;
  max-width: 26rem;
}

.order-illu {
  width: min(100%, 280px);
  opacity: 0.95;
}

.order-panel {
  background: var(--panel);
  border: 1px solid var(--line);
  padding: clamp(1.15rem, 3vw, 1.75rem);
  width: 100%;
  min-width: 0;
}

.order-tabs {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  padding: 0.3rem;
  margin-bottom: 1.25rem;
  background: #efeae2;
}

.order-tab {
  position: relative;
  z-index: 1;
  border: none;
  background: transparent;
  padding: 0.7rem 0.4rem;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 650;
  color: var(--ink-soft);
  cursor: pointer;
  transition: color 0.2s ease;
}

.order-tab.active {
  color: var(--ink);
}

.order-tab-indicator {
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

.order-tab-indicator.right {
  transform: translateX(100%);
}

.order-feedback {
  margin-bottom: 1rem;
  padding: 0.75rem 0.9rem;
  font-size: 0.9rem;
  line-height: 1.4;
  border-left: 3px solid;
}

.order-feedback.error {
  background: #fef3f2;
  border-color: var(--err);
  color: var(--err);
}

.order-feedback.success {
  background: #ecfdf3;
  border-color: var(--ok);
  color: var(--ok);
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
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

.field input,
.field select,
.field textarea {
  width: 100%;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink);
  font-family: inherit;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  -webkit-appearance: none;
  appearance: none;
}

.field input,
.field select {
  height: 48px;
  padding: 0 0.9rem;
}

.field textarea {
  padding: 0.75rem 0.9rem;
  resize: vertical;
  min-height: 110px;
}

.field select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23475467' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.9rem center;
  padding-right: 2.2rem;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(249, 92, 25, 0.15);
}

.submit-btn {
  margin-top: 0.25rem;
  width: 100%;
  height: 50px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 650;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
  touch-action: manipulation;
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent-deep);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .order-inner {
    grid-template-columns: 1fr;
  }

  .order-intro {
    position: static;
  }

  .order-illu {
    display: none;
  }
}

@media (max-width: 480px) {
  .order-panel {
    padding: 1rem;
  }

  .order-tab {
    font-size: 0.88rem;
    padding: 0.65rem 0.25rem;
  }
}
</style>
