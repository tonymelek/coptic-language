<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import CopticKeyboard from '../components/CopticKeyboard.vue'
import DictionaryEntryResult from '../components/DictionaryEntryResult.vue'
import { useCopticTextInput } from '../composables/useCopticTextInput.js'
import { SEARCH_MODES, searchDictionary } from '../lib/dictionarySearch.js'

const mode = ref('copticWord')
const { text: query, textareaRef: inputRef, insertAtCursor, backspace } = useCopticTextInput('')
const results = ref([])
const loading = ref(false)
const searched = ref(false)
const error = ref('')
const keyboardOpen = ref(false)

const isCopticMode = computed(() => mode.value === 'copticWord')

/** Suppress the OS soft keyboard on touch only when searching Coptic. */
const suppressOsKeyboard =
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)

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
  closeKeyboard()

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

function openKeyboard() {
  if (!isCopticMode.value) return
  keyboardOpen.value = true
}

function closeKeyboard() {
  keyboardOpen.value = false
}

function onQueryFocus() {
  if (isCopticMode.value) openKeyboard()
}

function onQueryClick() {
  if (isCopticMode.value) openKeyboard()
}

watch(mode, (next) => {
  if (next !== 'copticWord') closeKeyboard()
})

watch(keyboardOpen, (open) => {
  document.body.classList.toggle('overflow-hidden', open)
})

onBeforeUnmount(() => {
  document.body.classList.remove('overflow-hidden')
})

function refocusInput() {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function onInsert(value) {
  insertAtCursor(value)
  refocusInput()
}

function onBackspace() {
  backspace()
  refocusInput()
}
</script>

<template>
  <div
    class="max-w-3xl mx-auto px-4 py-10"
    :class="keyboardOpen ? 'pb-72' : ''"
  >
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
        <div class="flex items-center justify-between gap-3 mb-2">
          <span class="text-sm font-semibold text-burgundy-900">
            {{ SEARCH_MODES.find((option) => option.id === mode)?.label }}
          </span>
          <button
            v-if="isCopticMode && !keyboardOpen"
            type="button"
            class="text-sm font-semibold text-burgundy-700 hover:text-burgundy-900"
            @click="openKeyboard"
          >
            Show keyboard
          </button>
        </div>
        <input
          ref="inputRef"
          v-model="query"
          type="search"
          :readonly="isCopticMode && suppressOsKeyboard"
          :inputmode="isCopticMode ? 'none' : 'search'"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          dir="auto"
          enterkeyhint="search"
          class="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent caret-burgundy-700"
          :class="isCopticMode ? 'font-coptic text-2xl cursor-text' : ''"
          :placeholder="
            mode === 'copticWord'
              ? 'e.g. ⲁⲁϤ'
              : mode === 'transliteration'
                ? 'e.g. aaF'
                : 'e.g. Fly'
          "
          @focus="onQueryFocus"
          @click="onQueryClick"
        />
        <p v-if="isCopticMode" class="mt-2 text-xs text-slate-500">
          Tap the field to open the on-screen Coptic keyboard
          <template v-if="suppressOsKeyboard"> (mobile system keyboard is disabled)</template>.
        </p>
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

  <Teleport to="body">
    <div
      v-show="keyboardOpen && isCopticMode"
      class="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-label="Coptic on-screen keyboard"
    >
      <button
        type="button"
        class="absolute inset-0 bg-burgundy-900/30 border-0 cursor-default"
        aria-label="Hide keyboard"
        @click="closeKeyboard"
      />
      <div class="absolute inset-x-0 bottom-0 max-w-3xl mx-auto animate-[slideUp_0.2s_ease-out]">
        <CopticKeyboard
          @insert="onInsert"
          @backspace="onBackspace"
          @close="closeKeyboard"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0.6;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
