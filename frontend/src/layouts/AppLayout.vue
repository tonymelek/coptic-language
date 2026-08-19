<script setup>
import { RouterView } from 'vue-router'
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <AppHeader />

    <main id="main-content" class="flex-1" tabindex="-1">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>
