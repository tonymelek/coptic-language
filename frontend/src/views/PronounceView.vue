<script setup>
import { pronounce } from 'coptic-pronounce'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const input = ref('ⲁⲙⲏⲛ')

function transliterate(lang) {
  if (!input.value.trim()) return { text: '', error: false }
  try {
    return { text: pronounce(input.value, lang), error: false }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid input'
    return { text: msg, error: true }
  }
}

const english = computed(() => transliterate('en'))
const arabic = computed(() => transliterate('ar'))
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-10">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-extrabold text-burgundy-900 mb-2">Coptic Pronounce</h1>
      <p class="text-slate-700">Phonetic transliteration of Coptic Unicode into English and Arabic script.</p>
      <div class="w-12 h-1 bg-gold mx-auto mt-4 rounded-full"></div>
    </div>

    <div class="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 border-t-4 border-t-burgundy-700 shadow-sm space-y-6">
      <label class="block">
        <span class="block text-sm font-semibold text-burgundy-900 mb-2">Coptic Unicode</span>
        <textarea
          v-model="input"
          rows="3"
          spellcheck="false"
          dir="auto"
          class="w-full rounded-lg border border-slate-300 px-4 py-3 font-coptic text-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent resize-y whitespace-pre-wrap break-words"
          placeholder="e.g. ⲡⲛⲟⲩϯ"
        />
      </label>

      <div class="space-y-4">
        <div>
          <span class="block text-sm font-semibold text-burgundy-900 mb-2">English</span>
          <output
            class="block min-h-[3rem] rounded-lg px-4 py-3 text-lg whitespace-pre-wrap break-words"
            :class="english.error ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-slate-50 text-slate-900 border border-slate-200'"
          >{{ english.text || '—' }}</output>
        </div>
        <div>
          <span class="block text-sm font-semibold text-burgundy-900 mb-2">Arabic</span>
          <output
            class="font-arabic block min-h-[3rem] rounded-lg px-4 py-3 text-xl whitespace-pre-wrap break-words text-right"
            dir="rtl"
            :class="arabic.error ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-slate-50 text-slate-900 border border-slate-200'"
          >{{ arabic.text || '—' }}</output>
        </div>
      </div>
    </div>

    <p class="text-center text-sm text-slate-600 mt-6">
      Tip: use the
      <RouterLink to="/unicode" class="font-semibold text-burgundy-700 hover:text-burgundy-900">Unicode converter</RouterLink>
      first if your text is in Antonios font encoding.
    </p>
  </div>
</template>
