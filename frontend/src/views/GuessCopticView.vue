<script setup>
import { guessCoptic } from 'coptic-pronounce'
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

/** @type {import('vue').Ref<'en' | 'ar'>} */
const from = ref('en')
const input = ref('Epshois')

const examples = {
  en: 'Epshois',
  ar: 'إبشويس',
}

watch(from, (lang) => {
  if (!input.value.trim() || Object.values(examples).includes(input.value)) {
    input.value = examples[lang]
  }
})

const result = computed(() => {
  const text = input.value.trim()
  if (!text) return { best: '', candidates: [], error: null }
  try {
    const { best, candidates } = guessCoptic(text, from.value)
    return { best, candidates, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not guess Coptic'
    return { best: '', candidates: [], error: msg }
  }
})
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-10">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-extrabold text-burgundy-900 mb-2">Guess Coptic</h1>
      <p class="text-slate-700">
        Best-effort Coptic Unicode from Latin or Arabic phonetic spelling.
      </p>
      <div class="w-12 h-1 bg-gold mx-auto mt-4 rounded-full"></div>
    </div>

    <div class="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 border-t-4 border-t-burgundy-700 shadow-sm space-y-6">
      <div>
        <span class="block text-sm font-semibold text-burgundy-900 mb-2">Input language</span>
        <div class="inline-flex rounded-lg border border-slate-300 overflow-hidden" role="group" aria-label="Input language">
          <button
            type="button"
            class="px-4 py-2 text-sm font-semibold transition"
            :class="from === 'en' ? 'bg-burgundy-700 text-white' : 'bg-white text-burgundy-900 hover:bg-slate-50'"
            :aria-pressed="from === 'en'"
            @click="from = 'en'"
          >
            English / Latin
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-semibold transition border-l border-slate-300"
            :class="from === 'ar' ? 'bg-burgundy-700 text-white' : 'bg-white text-burgundy-900 hover:bg-slate-50'"
            :aria-pressed="from === 'ar'"
            @click="from = 'ar'"
          >
            Arabic
          </button>
        </div>
      </div>

      <label class="block">
        <span class="block text-sm font-semibold text-burgundy-900 mb-2">
          {{ from === 'ar' ? 'Arabic phonetics' : 'Latin phonetics' }}
        </span>
        <textarea
          v-model="input"
          rows="3"
          spellcheck="false"
          :dir="from === 'ar' ? 'rtl' : 'ltr'"
          :class="[
            'w-full rounded-lg border border-slate-300 px-4 py-3 text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent resize-y whitespace-pre-wrap break-words',
            from === 'ar' ? 'font-arabic text-xl text-right' : '',
          ]"
          :placeholder="from === 'ar' ? 'مثلاً إبشويس' : 'e.g. Epshois'"
        />
      </label>

      <div class="text-center text-gold text-xl font-bold">↓</div>

      <div>
        <span class="block text-sm font-semibold text-burgundy-900 mb-2">Best guess</span>
        <output
          class="font-coptic block min-h-[3.5rem] rounded-lg px-4 py-3 text-2xl whitespace-pre-wrap break-words"
          :class="result.error
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-burgundy-50 border border-burgundy-100 text-burgundy-900'"
        >{{ result.error || result.best || '—' }}</output>
      </div>

      <div v-if="result.candidates.length > 1">
        <span class="block text-sm font-semibold text-burgundy-900 mb-2">Other candidates</span>
        <ul class="space-y-2">
          <li
            v-for="(c, i) in result.candidates.slice(1)"
            :key="`${c.coptic}-${i}`"
            class="flex items-baseline justify-between gap-3 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2"
          >
            <span class="font-coptic text-xl text-burgundy-900">{{ c.coptic }}</span>
            <span v-if="c.note" class="text-xs text-slate-500 shrink-0">{{ c.note }}</span>
          </li>
        </ul>
      </div>
    </div>

    <p class="text-center text-sm text-slate-600 mt-6">
      Phonetic spelling is often ambiguous — candidates are ranked best-effort.
      Go the other way with
      <RouterLink to="/pronounce" class="font-semibold text-burgundy-700 hover:text-burgundy-900">Coptic Pronounce</RouterLink>.
    </p>
  </div>
</template>
