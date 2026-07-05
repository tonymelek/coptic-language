<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  to: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
})
</script>

<template>
  <RouterLink
    :to="to"
    class="block p-6 bg-white rounded-xl border border-slate-200 border-t-4 border-t-burgundy-700 shadow-sm hover:shadow-md hover:border-burgundy-700 transition no-underline group"
  >
    <h2 class="font-bold text-slate-900 group-hover:text-burgundy-700 mb-2">{{ title }}</h2>
    <p class="text-sm text-slate-700 mb-3">{{ description }}</p>
    <span class="text-sm font-semibold text-burgundy-700">Open →</span>
  </RouterLink>
</template>
