<template>
  <section id="deliver_form">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5 col-xl-4">
          <img src="../../assets/img/illustrations/callback.png" alt="callback" />
          <h5 class="text-danger">REQUEST A CALLBACK</h5>
          <h2>We will contact in the shortest time.</h2>
          <p class="text-muted">Monday to Friday, 9am-5pm.</p>
        </div>

        <div class="col-md-6 col-lg-5 col-xl-4">
          <div>
            <ul class="nav nav-tabs mb-3" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'livraison' }"
                  @click="activeTab = 'livraison'"
                  type="button"
                >
                  Livraison
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'recuperation' }"
                  @click="activeTab = 'recuperation'"
                  type="button"
                >
                  Recuperation
                </button>
              </li>
            </ul>

            <div v-if="feedback.message" class="alert" :class="feedback.type === 'error' ? 'alert-danger' : 'alert-success'">
              {{ feedback.message }}
            </div>

            <form v-if="activeTab === 'livraison'" class="row" @submit.prevent="submitLivraison">
              <div class="mb-3">
                <input
                  v-model="livraison.name"
                  class="form-control form-quriar-control"
                  type="text"
                  placeholder="Nom"
                  required
                />
              </div>

              <div class="mb-3">
                <input
                  v-model="livraison.email"
                  class="form-control form-quriar-control"
                  type="email"
                  placeholder="Email"
                  required
                />
              </div>

              <div class="mb-3">
                <input
                  v-model="livraison.address"
                  class="form-control form-quriar-control"
                  type="text"
                  placeholder="Adresse de livraison"
                  required
                />
              </div>

              <div class="mb-3">
                <select
                  v-model="livraison.courier"
                  class="form-select form-quriar-control"
                  :disabled="loadingLivraison"
                  required
                >
                  <option value="">Selectionnez un livreur</option>
                  <option v-for="c in couriers" :key="c.id" :value="c.id">
                    {{ c.username }}
                  </option>
                </select>
              </div>

              <div class="mb-5">
                <textarea
                  v-model="livraison.message"
                  class="form-control form-quriar-control border-400"
                  placeholder="Informations complementaires"
                  style="height: 150px"
                ></textarea>
              </div>

              <div class="d-grid">
                <button class="btn btn-primary" type="submit" :disabled="loadingLivraison">
                  {{ loadingLivraison ? 'Envoi...' : 'Envoyer' }}
                  <i class="fas fa-paper-plane ms-2"></i>
                </button>
              </div>
            </form>

            <form v-else class="row" @submit.prevent="submitRecuperation">
              <div class="mb-3">
                <input
                  v-model="recuperation.name"
                  class="form-control form-quriar-control"
                  type="text"
                  placeholder="Nom"
                  required
                />
              </div>

              <div class="mb-3">
                <input
                  v-model="recuperation.phone"
                  class="form-control form-quriar-control"
                  type="tel"
                  placeholder="Telephone"
                  required
                />
              </div>

              <div class="mb-3">
                <input
                  v-model="recuperation.pickupAddress"
                  class="form-control form-quriar-control"
                  type="text"
                  placeholder="Adresse de recuperation"
                  required
                />
              </div>

              <div class="mb-5">
                <textarea
                  v-model="recuperation.message"
                  class="form-control form-quriar-control border-400"
                  placeholder="Informations complementaires"
                  style="height: 150px"
                ></textarea>
              </div>

              <div class="d-grid">
                <button class="btn btn-primary" type="submit" :disabled="loadingRecuperation">
                  {{ loadingRecuperation ? 'Envoi...' : 'Demander recuperation' }}
                  <i class="fas fa-paper-plane ms-2"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
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
    console.log("Livreurs loaded:", response.data);
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