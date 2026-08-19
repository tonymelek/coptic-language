import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'app-home', component: () => import('./views/AppHome.vue') },
      { path: 'dictionary', name: 'dictionary', component: () => import('./views/DictionaryView.vue') },
      { path: 'unicode', name: 'unicode', component: () => import('./views/UnicodeView.vue') },
      { path: 'pronounce', name: 'pronounce', component: () => import('./views/PronounceView.vue') },
      { path: 'guess-coptic', name: 'guess-coptic', component: () => import('./views/GuessCopticView.vue') },
      { path: 'write', name: 'write', component: () => import('./views/CopticWriteView.vue') },
      { path: 'playground', name: 'playground', component: () => import('./views/PlaygroundPage.vue') },
      { path: 'try', redirect: { name: 'playground' } },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
