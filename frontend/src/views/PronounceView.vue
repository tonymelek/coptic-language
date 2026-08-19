<script setup>
import { pronounce } from 'coptic-pronounce'
import { computed, nextTick, ref } from 'vue'
import { RouterLink } from 'vue-router'
import CopticKeyboardDialog from '../components/CopticKeyboardDialog.vue'
import CopyButton from '../components/CopyButton.vue'
import { isCoarsePointer, useCopticTextInput } from '../composables/useCopticTextInput.js'

const {
  text: input,
  textareaRef,
  previewRef,
  caret,
  insertAtCursor,
  backspace,
  setSelection,
  moveCaretToEnd,
  focusPreview,
} = useCopticTextInput('ⲁⲙⲏⲛ')
const keyboardOpen = ref(false)
const keyboardRef = ref(null)
const suppressKeyboardOpen = ref(false)

/** Suppress the OS soft keyboard on touch phones; leave desktop editable. */
const suppressOsKeyboard = isCoarsePointer()

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

function bindPreviewField() {
  previewRef.value = keyboardRef.value?.previewInputRef ?? previewRef.value
}

function openKeyboard() {
  // Always resume at end of text. (Syncing the main readonly field often
  // reports caret 0 on mobile, which makes ⌫ appear broken after reshow.)
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

function onTextareaFocus() {
  if (suppressKeyboardOpen.value) return
  openKeyboard()
}

function onTextareaClick() {
  if (suppressKeyboardOpen.value) return
  openKeyboard()
}

function onPreviewReady(el) {
  previewRef.value = el
  focusPreview()
}

function onCaretChange({ start, end }) {
  setSelection(start, end)
}

function onInsert(value) {
  insertAtCursor(value)
}

function onBackspace() {
  backspace()
}
</script>

<template>
  <div
    class="max-w-2xl mx-auto px-4 py-10"
    :class="keyboardOpen ? 'pb-72' : ''"
  >
    <div class="text-center mb-8">
      <h1 class="text-3xl font-extrabold text-burgundy-900 mb-2">Coptic Pronounce</h1>
      <p class="text-slate-700">Phonetic transliteration of Coptic Unicode into English and Arabic script.</p>
      <div class="w-12 h-1 bg-gold mx-auto mt-4 rounded-full"></div>
    </div>

    <div class="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 border-t-4 border-t-burgundy-700 shadow-sm space-y-6">
      <label class="block">
        <div class="flex items-center justify-between gap-3 mb-2">
          <span class="text-sm font-semibold text-burgundy-900">Coptic Unicode</span>
          <button
            v-if="!keyboardOpen"
            type="button"
            class="inline-flex items-center justify-center min-h-11 px-3 rounded-md text-sm font-semibold text-burgundy-700 hover:text-burgundy-900 hover:bg-burgundy-50"
            @click="openKeyboard"
          >
            Show keyboard
          </button>
        </div>
        <textarea
          ref="textareaRef"
          v-model="input"
          rows="3"
          :readonly="suppressOsKeyboard"
          inputmode="none"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          dir="auto"
          enterkeyhint="done"
          class="w-full rounded-lg border border-slate-300 px-4 py-3 font-coptic text-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent resize-y whitespace-pre-wrap break-words caret-burgundy-700 cursor-text"
          placeholder="e.g. ⲡⲛⲟⲩϯ"
          @focus="onTextareaFocus"
          @click="onTextareaClick"
        />
        <p class="mt-2 text-xs text-slate-500">
          Tap the field to open the on-screen Coptic keyboard
          <template v-if="suppressOsKeyboard"> (mobile system keyboard is disabled)</template>.
          Use Hide when you want to read the transliteration.
        </p>
      </label>

      <div class="space-y-4">
        <div>
          <div class="flex items-center justify-between gap-3 mb-2">
            <span class="text-sm font-semibold text-burgundy-900">English</span>
            <CopyButton :text="english.error ? '' : english.text" />
          </div>
          <output
            class="block min-h-[3rem] rounded-lg px-4 py-3 text-lg whitespace-pre-wrap break-words"
            :class="english.error ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-slate-50 text-slate-900 border border-slate-200'"
            :role="english.error ? 'alert' : undefined"
          >{{ english.text || '—' }}</output>
        </div>
        <div>
          <div class="flex items-center justify-between gap-3 mb-2">
            <span class="text-sm font-semibold text-burgundy-900">Arabic</span>
            <CopyButton :text="arabic.error ? '' : arabic.text" />
          </div>
          <output
            class="font-arabic block min-h-[3rem] rounded-lg px-4 py-3 text-xl whitespace-pre-wrap break-words text-right"
            dir="rtl"
            :class="arabic.error ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-slate-50 text-slate-900 border border-slate-200'"
            :role="arabic.error ? 'alert' : undefined"
          >{{ arabic.text || '—' }}</output>
        </div>
      </div>
    </div>

    <p class="text-center text-sm text-slate-600 mt-6">
      Tip: use the
      <RouterLink to="/unicode" class="font-semibold text-burgundy-700 hover:text-burgundy-900">Unicode converter</RouterLink>
      first if your text is in Antonios font encoding. Going the other way?
      <RouterLink to="/guess-coptic" class="font-semibold text-burgundy-700 hover:text-burgundy-900">Guess Coptic</RouterLink>
      from Latin or Arabic phonetics.
      For the npm APIs, open the
      <RouterLink to="/playground" class="font-semibold text-burgundy-700 hover:text-burgundy-900">playground</RouterLink>.
    </p>
  </div>

  <CopticKeyboardDialog
    ref="keyboardRef"
    :open="keyboardOpen"
    :preview="input"
    :caret="caret"
    preview-placeholder="Type Coptic…"
    @close="closeKeyboard"
    @insert="onInsert"
    @backspace="onBackspace"
    @caret-change="onCaretChange"
    @preview-ready="onPreviewReady"
  />
</template>
