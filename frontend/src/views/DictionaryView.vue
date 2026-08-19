<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import CopticKeyboardDialog from '../components/CopticKeyboardDialog.vue'
import DictionaryEntryResult from '../components/DictionaryEntryResult.vue'
import { isCoarsePointer, useCopticTextInput } from '../composables/useCopticTextInput.js'
import { SEARCH_MODES, searchDictionary } from '../lib/dictionarySearch.js'

const route = useRoute()
const router = useRouter()

const MODE_IDS = new Set(SEARCH_MODES.map((option) => option.id))

function modeFromQuery(value) {
  return MODE_IDS.has(value) ? value : 'copticWord'
}

const mode = ref(modeFromQuery(typeof route.query.mode === 'string' ? route.query.mode : ''))
const {
  text: query,
  textareaRef: inputRef,
  previewRef,
  caret,
  insertAtCursor,
  backspace,
  setSelection,
  moveCaretToEnd,
  focusPreview,
} = useCopticTextInput(typeof route.query.q === 'string' ? route.query.q : '')
const results = ref([])
const loading = ref(false)
const searched = ref(false)
const lastQuery = ref('')
const error = ref('')
const keyboardOpen = ref(false)
const keyboardRef = ref(null)
const hydrating = ref(true)
const suppressKeyboardOpen = ref(false)

const isCopticMode = computed(() => mode.value === 'copticWord')
const otherModes = computed(() => SEARCH_MODES.filter((option) => option.id !== mode.value))

/** Suppress the OS soft keyboard on touch only when searching Coptic. */
const suppressOsKeyboard = isCoarsePointer()

function currentQueryRecord() {
  const q = query.value.trim()
  const next = {}
  if (q) next.q = q
  if (mode.value !== 'copticWord') next.mode = mode.value
  return next
}

function queriesMatch(a, b) {
  return (a.q || '') === (b.q || '') && (a.mode || '') === (b.mode || '')
}

function syncQueryToUrl() {
  const next = currentQueryRecord()
  if (queriesMatch(route.query, next)) return
  router.replace({ query: next })
}

async function runSearch() {
  const trimmed = query.value.trim()
  if (!trimmed) {
    results.value = []
    searched.value = false
    lastQuery.value = ''
    error.value = ''
    syncQueryToUrl()
    return
  }

  loading.value = true
  searched.value = true
  lastQuery.value = trimmed
  error.value = ''
  results.value = []
  closeKeyboard()
  syncQueryToUrl()

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

function bindPreviewField() {
  previewRef.value = keyboardRef.value?.previewInputRef ?? previewRef.value
}

function openKeyboard() {
  if (!isCopticMode.value) return
  // Resume at end — avoids sticky caret 0 after hide/reshow on mobile.
  moveCaretToEnd()
  keyboardOpen.value = true
  nextTick(() => {
    bindPreviewField()
    focusPreview()
  })
}

function closeKeyboard() {
  if (!keyboardOpen.value) return
  suppressKeyboardOpen.value = true
  keyboardOpen.value = false
  nextTick(() => {
    suppressKeyboardOpen.value = false
  })
}

function onQueryFocus() {
  if (suppressKeyboardOpen.value) return
  if (isCopticMode.value) openKeyboard()
}

function onQueryClick() {
  if (suppressKeyboardOpen.value) return
  if (isCopticMode.value) openKeyboard()
}

function onPreviewReady(el) {
  previewRef.value = el
  focusPreview()
}

function onCaretChange({ start, end }) {
  setSelection(start, end)
}

watch(mode, (next) => {
  if (hydrating.value) return
  if (next !== 'copticWord') closeKeyboard()
  if (query.value.trim() && searched.value) {
    runSearch()
    return
  }
  syncQueryToUrl()
})

function onInsert(value) {
  insertAtCursor(value)
}

function onBackspace() {
  backspace()
}

onMounted(() => {
  if (query.value.trim()) {
    runSearch().finally(() => {
      hydrating.value = false
    })
    return
  }
  hydrating.value = false
})
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
              class="inline-block rounded-full border border-slate-300 px-4 py-2 min-h-11 text-sm font-medium text-slate-700 transition peer-checked:border-burgundy-700 peer-checked:bg-burgundy-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-burgundy-700 peer-focus-visible:ring-offset-2"
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
            class="inline-flex items-center justify-center min-h-11 px-3 rounded-md text-sm font-semibold text-burgundy-700 hover:text-burgundy-900 hover:bg-burgundy-50"
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
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span
          class="search-spinner inline-block h-5 w-5 rounded-full border-2 border-burgundy-700 border-t-transparent"
          aria-hidden="true"
        />
        <span>Searching...</span>
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800"
        role="alert"
      >
        {{ error }}
      </div>

      <div
        v-else-if="searched && results.length === 0"
        class="rounded-xl border border-slate-200 bg-white px-6 py-8 text-center text-slate-700 space-y-4"
      >
        <p>No results for “{{ lastQuery }}”.</p>
        <p class="text-sm text-slate-600">Try another search mode, or type Coptic another way:</p>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <button
            v-for="option in otherModes"
            :key="option.id"
            type="button"
            class="inline-flex items-center justify-center min-h-11 rounded-full border border-slate-300 px-4 text-sm font-medium text-burgundy-800 hover:border-burgundy-700 hover:bg-burgundy-50"
            @click="mode = option.id"
          >
            Search by {{ option.label.toLowerCase() }}
          </button>
          <RouterLink
            to="/write"
            class="inline-flex items-center justify-center min-h-11 rounded-full border border-slate-300 px-4 text-sm font-medium text-burgundy-800 no-underline hover:border-burgundy-700 hover:bg-burgundy-50"
          >
            Open Write
          </RouterLink>
          <RouterLink
            to="/guess-coptic"
            class="inline-flex items-center justify-center min-h-11 rounded-full border border-slate-300 px-4 text-sm font-medium text-burgundy-800 no-underline hover:border-burgundy-700 hover:bg-burgundy-50"
          >
            Guess Coptic
          </RouterLink>
        </div>
      </div>

      <div v-else-if="results.length" class="space-y-4">
        <p class="text-sm text-slate-600" aria-live="polite">
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

  <CopticKeyboardDialog
    ref="keyboardRef"
    :open="keyboardOpen && isCopticMode"
    :preview="query"
    :caret="caret"
    preview-placeholder="Type Coptic…"
    @close="closeKeyboard"
    @insert="onInsert"
    @backspace="onBackspace"
    @caret-change="onCaretChange"
    @preview-ready="onPreviewReady"
  />
</template>
