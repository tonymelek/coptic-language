<script setup>
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

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <ToolCard
        v-for="tool in tools"
        :key="tool.to"
        :to="tool.to"
        :title="tool.title"
        :description="tool.description"
      />
    </div>
  </div>
</template>
