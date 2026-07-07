<script setup>
import { computed } from 'vue'

const baseUrl = computed(() => {
  return window.location.href.replace(/\/app.*$/, '');
})
</script>
<template>
  <footer class="bg-burgundy-900 border-t-4 border-gold mt-auto py-10 px-4 text-white">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-[15px]">
      <p class="font-bold tracking-wide text-base">COPTIC LANGUAGE</p>
      <div class="flex flex-wrap justify-center gap-8 font-semibold">
        <a :href="baseUrl" class="text-white hover:text-gold no-underline">Home</a>
        <a :href="baseUrl + '/about.html'" class="text-white hover:text-gold no-underline">About</a>
        <a :href="baseUrl + '/story.html'" class="text-white hover:text-gold no-underline">Story</a>
        <a :href="baseUrl + '/contact.html'" class="text-white hover:text-gold no-underline">Contact</a>
        <a :href="baseUrl + '/support.html'" class="text-white hover:text-gold no-underline">Support</a>
      </div>
    </div>
  </footer>
</template>
