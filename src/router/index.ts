import { createRouter, createWebHistory } from 'vue-router'
import SignIn from "@/views/SignIn.vue";
import SignUp from "@/views/SignUp.vue";
const routes = [
  { path: '/', redirect: '/signin' },
  { path: '/signin', component: SignIn },
  { path: '/signup', component: SignUp },
  { path: '/signup/success', component: () => import('@/views/SignupSuccess.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
