<template>
  <section id="deliver_form">

    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5 col-xl-4"><img src="../../assets/img/illustrations/callback.png" alt="..." />
          <h5 class="text-danger">REQUEST A CALLBACK</h5>
          <h2>We will contact in the shortest time.</h2>
          <p class="text-muted">Monday to Friday, 9am-5pm.</p>
        </div>
        <div class="col-md-6 col-lg-5 col-xl-4">
          <div>
            <ul class="nav nav-tabs mb-3" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: activeTab === 'livraison' }" @click="activeTab = 'livraison'">Livraison</button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: activeTab === 'recuperation' }" @click="activeTab = 'recuperation'">Récupération</button>
              </li>
            </ul>

            <!-- Livraison form -->
            <form v-if="activeTab === 'livraison'" class="row" @submit.prevent="submitLivraison">
              <div class="mb-3">
                <label class="form-label visually-hidden" for="inputName">Name</label>
                <input v-model="livraison.name" class="form-control form-quriar-control" id="inputName" type="text" placeholder="Nom" />
              </div>
              <div class="mb-3">
                <label class="form-label visually-hidden" for="inputEmail">Email</label>
                <input v-model="livraison.email" class="form-control form-quriar-control" id="inputEmail" type="email" placeholder="Email" />
              </div>
              <div class="mb-3">
                <label class="form-label visually-hidden" for="inputAddress">Adresse de livraison</label>
                <input v-model="livraison.address" class="form-control form-quriar-control" id="inputAddress" type="text" placeholder="Adresse de livraison" />
              </div>
                <div class="mb-3">
                  <label class="form-label visually-hidden" for="inputCourier">Choisir le livreur</label>
                  <select v-model="livraison.courier" class="form-select form-quriar-control" id="inputCourier">
                    <option value="">Sélectionnez un livreur</option>
                    <option v-for="c in couriers" :key="c.id ?? c" :value="c.id ?? c">{{ c.username  }}</option>
                  </select>
                </div>
              <div class="mb-5">
                <label class="form-label visually-hidden" for="validationTextarea">Message</label>
                <textarea v-model="livraison.message" class="form-control form-quriar-control border-400" id="validationTextarea" placeholder="Informations complémentaires" style="height: 150px"></textarea>
              </div>
              <div class="d-grid">
                <button class="btn btn-primary" type="submit">Envoyer <i class="fas fa-paper-plane ms-2"></i></button>
              </div>
            </form>

            <!-- Récupération form -->
            <form v-else class="row" @submit.prevent="submitRecuperation">
              <div class="mb-3">
                <label class="form-label visually-hidden" for="recName">Name</label>
                <input v-model="recuperation.name" class="form-control form-quriar-control" id="recName" type="text" placeholder="Nom" />
              </div>
              <div class="mb-3">
                <label class="form-label visually-hidden" for="recPhone">Téléphone</label>
                <input v-model="recuperation.phone" class="form-control form-quriar-control" id="recPhone" type="tel" placeholder="Téléphone" />
              </div>
              <div class="mb-3">
                <label class="form-label visually-hidden" for="recPickup">Adresse de récupération</label>
                <input v-model="recuperation.pickupAddress" class="form-control form-quriar-control" id="recPickup" type="text" placeholder="Adresse de récupération" />
              </div>
              <div class="mb-5">
                <label class="form-label visually-hidden" for="recMessage">Message</label>
                <textarea v-model="recuperation.message" class="form-control form-quriar-control border-400" id="recMessage" placeholder="Informations complémentaires" style="height: 150px"></textarea>
              </div>
              <div class="d-grid">
                <button class="btn btn-primary" type="submit">Demander récupération <i class="fas fa-paper-plane ms-2"></i></button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
    <!-- end of .container-->

  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/services/api'

const activeTab = ref('livraison')

const couriers = ref([])

const livraison = reactive({ name: '', email: '', address: '', courier: '', message: '' })
const recuperation = reactive({ name: '', phone: '', pickupAddress: '', message: '' })

onMounted(async () => {
  try {
    const res = await api.get('auth/livreurs/')
    if (Array.isArray(res.data) && res.data.length) couriers.value = res.data
  } catch (e) {
    // keep placeholder list if API not available
    console.warn('Could not fetch couriers, using defaults', e)
  }
})

function submitLivraison() {
  // TODO: remplacer par envoi via API
  console.log('Livraison submitted', JSON.parse(JSON.stringify(livraison)))
  // reset
  livraison.name = livraison.email = livraison.address = livraison.courier = livraison.message = ''
}

function submitRecuperation() {
  console.log('Récupération submitted', JSON.parse(JSON.stringify(recuperation)))
  recuperation.name = recuperation.phone = recuperation.pickupAddress = recuperation.message = ''
}
</script>

