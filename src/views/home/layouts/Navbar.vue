<template>
    <nav class="navbar navbar-expand-lg navbar-light fixed-top py-3 d-block bg-white shadow-sm"
      data-navbar-on-scroll="data-navbar-on-scroll">
    <div class="container"><a class="navbar-brand" href="/home">
      <img src="@/assets/img/gallery/logo.png" height="45" alt="logo" />
    </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span
          class="navbar-toggler-icon"> </span></button>
      <div class="collapse navbar-collapse border-top border-lg-0 mt-4 mt-lg-0" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto pt-2 pt-lg-0 font-base">
          <li class="nav-item px-2">
            <router-link class="nav-link" :to="{ path: '/home' }">Acceuil</router-link>
          </li>
          <li class="nav-item px-2">
            <router-link class="nav-link" :to="{ path: '/home', hash: '#services' }">Nos Services</router-link>
          </li>
          <li class="nav-item px-2">
            <router-link class="nav-link" :to="{ path: '/home', hash: '#findUs' }">Nous contacter</router-link>
          </li>
          <li class="nav-item px-2">
            <router-link class="nav-link" :to="{ path: '/deliverer' }">Liste des livreurs</router-link>
          </li>
          <li v-if="isDeliverer" class="nav-item px-2">
            <router-link class="nav-link" :to="{ path: '/deliveries' }">
              <i class="bi bi-truck"></i> Mes livraisons
            </router-link>
          </li>
        </ul>
        
        <router-link class="btn btn-primary order-1 order-lg-0 ms-lg-3" :to="{ path: '/profile' }">Mon profil</router-link>
        <button @click="handleLogout" class="btn btn-outline-primary ms-lg-3">
          <i class="fa fa-sign-out" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const isDeliverer = ref(false);
const userRole = ref(null);

const handleLogout = () => {
  localStorage.clear();
  sessionStorage.clear();
  router.push('/');
};

onMounted(() => {
  // Récupérer les infos utilisateur depuis localStorage
  const userData = localStorage.getItem('user');
  console.log('User data:', userData);
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('Parsed user:', user);
      userRole.value = user.role;
      isDeliverer.value = user.role === 'livreur';
    } catch (error) {
      console.error('Erreur parsing user data:', error);
    }
  }
});
</script>