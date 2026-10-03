import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login/Login.vue'
import HomePage from '../views/home/HomePage.vue'

const publicRoutes = ['Login']

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true },
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/user_profile/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'MyOrders',
    component: () => import('../views/orders/MyOrders.vue'),
    meta: { requiresAuth: true, roles: ['client', 'admin'] },
  },
  {
    path: '/deliveries',
    name: 'MyDeliveries',
    component: () => import('../views/deliver_list/MyDeliveries.vue'),
    meta: { requiresAuth: true, roles: ['livreur'] },
  },
  {
    path: '/deliverer',
    name: 'Deliverer',
    component: () => import('../views/deliver_list/Deliverer.vue'),
    meta: { requiresAuth: true,roles: ['client', 'admin'] },
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: '',
        name: 'Admin',
        component: () => import('../views/admin/AdminHome.vue'),
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/AdminOrders.vue'),
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/AdminUsers.vue'),
      },
      {
        path: 'deliverers',
        name: 'AdminDeliverers',
        component: () => import('../views/admin/AdminDeliverers.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return savedPosition || { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access')
  const user = getStoredUser()

  if (to.meta.guestOnly && token) {
    if (user?.role === 'livreur') return next('/deliveries')
    if (user?.role === 'admin') return next('/admin')
    return next('/home')
  }

  if (user?.role === 'livreur' && to.path === '/home') {
    return next('/deliveries')
  }

  if (to.meta.requiresAuth && !token) {
    return next('/')
  }

  if (to.meta.roles && user && !to.meta.roles.includes(user.role)) {
    if (user.role === 'livreur') return next('/deliveries')
    if (user.role === 'admin') return next('/admin')
    return next('/home')
  }

  next()
})

export default router
