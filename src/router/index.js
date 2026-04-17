import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login/Login.vue'
import HomePage from '../views/home/HomePage.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path : '/profile',
    name : 'Profile',
    component : () => import('../views/user_profile/Profile.vue') 
  },
  {
    path : '/deliveries',
    name : 'MyDeliveries',
    component : () => import('../views/deliver_list/MyDeliveries.vue') 
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