<script setup>
import { RouterLink } from 'vue-router'
import ToolCard from '../components/ToolCard.vue'
import { tools } from '../config/tools.js'
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-extrabold text-burgundy-900 mb-2">Language tools</h1>
      <p class="text-slate-700">Dictionary, Unicode conversion, pronunciation, and writing.</p>
      <div class="w-12 h-1 bg-gold mx-auto mt-4 rounded-full"></div>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ToolCard
        v-for="tool in tools"
        :key="tool.to"
        :to="tool.to"
        :title="tool.title"
        :description="tool.description"
      />
    </div>

    <div class="mt-12 text-center space-y-4">
      <p class="text-sm text-slate-600">Building with the npm packages?</p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <RouterLink
          to="/playground"
          class="inline-flex items-center justify-center rounded-md bg-gold px-6 py-3 font-semibold text-burgundy-900 no-underline transition hover:bg-gold-hover"
        >
          Open playground
        </RouterLink>
        <a
          href="/packages.html"
          class="inline-flex items-center justify-center rounded-md border-2 border-burgundy-700 px-6 py-3 font-semibold text-burgundy-700 no-underline transition hover:bg-burgundy-50"
        >
          Install packages
        </a>
      </div>
    </div>
  </div>
</template>
