<script setup>
import { ref } from 'vue'
import DictionaryEntryResult from '../components/DictionaryEntryResult.vue'
import { SEARCH_MODES, searchDictionary } from '../lib/dictionarySearch.js'

const mode = ref('copticWord')
const query = ref('')
const results = ref([])
const loading = ref(false)
const searched = ref(false)
const error = ref('')

async function runSearch() {
  const trimmed = query.value.trim()
  if (!trimmed) {
    results.value = []
    searched.value = false
    error.value = ''
    return
  }

  loading.value = true
  searched.value = true
  error.value = ''
  results.value = []

  try {
    results.value = await searchDictionary(mode.value, trimmed)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Search failed'
  } finally {
    loading.value = false
  }
}

function onSubmit(event) {
  event.preventDefault()
  runSearch()
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-extrabold text-burgundy-900 mb-2">Coptic Dictionary</h1>
      <p class="text-slate-700">Search by Coptic word, transliteration, or meaning.</p>
      <div class="w-12 h-1 bg-gold mx-auto mt-4 rounded-full"></div>
    </div>

    <form
      class="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 border-t-4 border-t-burgundy-700 shadow-sm space-y-5"
      @submit="onSubmit"
    >
      <fieldset>
        <legend class="block text-sm font-semibold text-burgundy-900 mb-3">Search by</legend>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="option in SEARCH_MODES"
            :key="option.id"
            class="cursor-pointer"
          >
            <input
              v-model="mode"
              type="radio"
              name="search-mode"
              :value="option.id"
              class="peer sr-only"
            />
            <span
              class="inline-block rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition peer-checked:border-burgundy-700 peer-checked:bg-burgundy-700 peer-checked:text-white"
            >
              {{ option.label }}
            </span>
          </label>
        </div>
      </fieldset>

      <label class="block">
        <span class="block text-sm font-semibold text-burgundy-900 mb-2">
          {{ SEARCH_MODES.find((option) => option.id === mode)?.label }}
        </span>
        <input
          v-model="query"
          type="search"
          spellcheck="false"
          dir="auto"
          class="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
          :class="mode === 'copticWord' ? 'font-coptic text-2xl' : ''"
          :placeholder="
            mode === 'copticWord'
              ? 'e.g. ⲁⲁϤ'
              : mode === 'transliteration'
                ? 'e.g. aaF'
                : 'e.g. Fly'
          "
        />
      </label>

      <button
        type="submit"
        class="w-full rounded-lg bg-burgundy-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-burgundy-800 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading || !query.trim()"
      >
        Search
      </button>
    </form>

    <div class="mt-8">
      <div
        v-if="loading"
        class="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-10 text-slate-700"
      >
        <span
          class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-burgundy-700 border-t-transparent"
          aria-hidden="true"
        />
        <span>Searching...</span>
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800"
      >
        {{ error }}
      </div>

      <div
        v-else-if="searched && results.length === 0"
        class="rounded-xl border border-slate-200 bg-white px-6 py-8 text-center text-slate-700"
      >
        No results.
      </div>

      <div v-else-if="results.length" class="space-y-4">
        <p class="text-sm text-slate-600">
          {{ results.length }} {{ results.length === 1 ? 'result' : 'results' }}
        </p>

        <DictionaryEntryResult
          v-for="(result, index) in results"
          :key="`${result.pageId}-${result.entry.copticWord}-${result.entry.headword}-${index}`"
          :entry="result.entry"
          :page-id="result.pageId"
        />
      </div>
    </div>
  </div>
</template>
