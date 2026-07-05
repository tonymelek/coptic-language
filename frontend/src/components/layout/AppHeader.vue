<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { tools } from '../../config/tools.js'

const route = useRoute()
const logoSrc = `${import.meta.env.BASE_URL}images/logo-gold.png`

function isActive(path) {
  return route.path === path || route.path === path + '/'
}
</script>

<template>
  <header class="bg-burgundy-900 border-b-4 border-gold sticky top-0 z-50 shadow-md">
    <nav class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      <a href="/" class="flex items-center gap-2 sm:gap-2.5 text-base sm:text-lg font-bold tracking-tight text-gold hover:text-white transition shrink-0 no-underline">
        <img :src="logoSrc" alt="" class="h-8 w-8 sm:h-9 sm:w-9 shrink-0" width="36" height="36" decoding="async" />
        <span>COPTIC LANGUAGE</span>
      </a>
      <div class="flex items-center gap-1 sm:gap-2">
        <RouterLink
          v-for="tool in tools"
          :key="tool.to"
          :to="tool.to"
          class="px-3 py-1.5 text-sm font-semibold rounded-md transition no-underline"
          :class="isActive(tool.to)
            ? 'bg-gold text-burgundy-900'
            : 'text-white hover:text-gold hover:bg-burgundy-800'"
        >
          {{ tool.label }}
        </RouterLink>
      </div>
    </nav>
  </header>
</template>
