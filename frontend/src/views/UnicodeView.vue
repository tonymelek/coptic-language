<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { toUnicode } from 'coptic-antonios-unicode'
import CopyButton from '../components/CopyButton.vue'

const input = ref('amyn')

const output = computed(() => toUnicode(input.value))
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-10">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-extrabold text-burgundy-900 mb-2">Antonios Unicode</h1>
      <p class="text-slate-700">Convert Antonios-font Latin keyboard text to standard Coptic Unicode.</p>
      <div class="w-12 h-1 bg-gold mx-auto mt-4 rounded-full"></div>
    </div>

    <div class="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 border-t-4 border-t-burgundy-700 shadow-sm space-y-6">
      <label class="block">
        <span class="block text-sm font-semibold text-burgundy-900 mb-2">Antonios / Latin keyboard text</span>
        <textarea
          id="unicode-input"
          v-model="input"
          rows="4"
          spellcheck="false"
          class="w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent resize-y"
          placeholder="e.g. amyn"
        />
      </label>

      <div class="text-center text-gold text-xl font-bold" aria-hidden="true">↓</div>

      <div>
        <div class="flex items-center justify-between gap-3 mb-2">
          <span class="text-sm font-semibold text-burgundy-900">Coptic Unicode</span>
          <CopyButton :text="output" />
        </div>
        <output
          class="font-coptic block min-h-[3.5rem] rounded-lg bg-burgundy-50 border border-burgundy-100 px-4 py-3 text-2xl text-burgundy-900 whitespace-pre-wrap break-words"
          for="unicode-input"
        >{{ output || '—' }}</output>
      </div>
    </div>

    <p class="text-center text-sm text-slate-600 mt-6">
      Unmapped characters (spaces, punctuation) are preserved.
      <a href="/packages.html#coptic-antonios-unicode" class="text-burgundy-700 font-semibold hover:underline">npm package</a>
      ·
      <RouterLink to="/playground" class="text-burgundy-700 font-semibold hover:underline">playground</RouterLink>
    </p>
  </div>
</template>
