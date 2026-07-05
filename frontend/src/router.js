import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
import AppHome from './views/AppHome.vue'
import CopticWriteView from './views/CopticWriteView.vue'
import DictionaryView from './views/DictionaryView.vue'
import PronounceView from './views/PronounceView.vue'
import UnicodeView from './views/UnicodeView.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'app-home', component: AppHome },
      { path: 'dictionary', name: 'dictionary', component: DictionaryView },
      { path: 'unicode', name: 'unicode', component: UnicodeView },
      { path: 'pronounce', name: 'pronounce', component: PronounceView },
      { path: 'write', name: 'write', component: CopticWriteView },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
