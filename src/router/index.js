import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login/Login.vue'
import HomePage from '../views/home/HomePage.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,

      path: '/home',
    name: 'Home',
    component: HomePage
    

  },
  {
    path: '/',
    name: 'Login',
    // Chargement paresseux (Lazy loading) pour la future page d'accueil
    component: () => import('../views/login/Login.vue') 
  },
 
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/home/HomePage.vue') 
  },
  {
    path : '/profile',
    name : 'Profile',
    component : () => import('../views/user_profile/Profile.vue') 
  },

  {
    path : '/deliverer',
    name : 'Deliverer',
    component : () => import('../views/deliver_list/Deliverer.vue') 
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return savedPosition || { top: 0 }
  }
})

export default router