<script setup>
import { computed, nextTick, ref } from 'vue'
import { COPTIC_LETTER_PAIRS } from '../copticLetters.js'

const text = ref('')
const capsLock = ref(false)
const textareaRef = ref(null)

const letters = computed(() =>
  COPTIC_LETTER_PAIRS.map(([upper, lower]) => (capsLock.value ? upper : lower)),
)

function insertAtCursor(value) {
  const el = textareaRef.value
  if (!el) {
    text.value += value
    return
  }
  const start = el.selectionStart ?? text.value.length
  const end = el.selectionEnd ?? text.value.length
  text.value = text.value.slice(0, start) + value + text.value.slice(end)
  nextTick(() => {
    el.focus()
    const pos = start + value.length
    el.setSelectionRange(pos, pos)
  })
}

function insertLetter(letter) {
  insertAtCursor(letter)
}

function insertSpace() {
  insertAtCursor(' ')
}

function backspace() {
  const el = textareaRef.value
  if (!el) {
    text.value = text.value.slice(0, -1)
    return
  }
  const start = el.selectionStart ?? text.value.length
  const end = el.selectionEnd ?? text.value.length
  if (start !== end) {
    text.value = text.value.slice(0, start) + text.value.slice(end)
    nextTick(() => {
      el.focus()
      el.setSelectionRange(start, start)
    })
    return
  }
  if (start > 0) {
    text.value = text.value.slice(0, start - 1) + text.value.slice(start)
    nextTick(() => {
      el.focus()
      el.setSelectionRange(start - 1, start - 1)
    })
  }
}

function toggleCapsLock() {
  capsLock.value = !capsLock.value
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-extrabold text-burgundy-900 mb-2">Coptic Write</h1>
      <p class="text-slate-700">Type Coptic Unicode with the on-screen keyboard.</p>
      <div class="w-12 h-1 bg-gold mx-auto mt-4 rounded-full"></div>
    </div>

    <div class="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 border-t-4 border-t-burgundy-700 shadow-sm space-y-6">
      <label class="block">
        <span class="block text-sm font-semibold text-burgundy-900 mb-2">Your text</span>
        <textarea
          ref="textareaRef"
          v-model="text"
          rows="5"
          spellcheck="false"
          dir="auto"
          class="w-full rounded-lg border border-slate-300 px-4 py-3 font-coptic text-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent resize-y whitespace-pre-wrap break-words"
          placeholder="ⲁⲙⲏⲛ"
        />
      </label>

      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4 space-y-2">
        <div class="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
          <button
            v-for="(letter, index) in letters"
            :key="index"
            type="button"
            class="font-coptic min-w-[2.5rem] h-11 sm:h-12 px-1 rounded-lg border border-slate-300 bg-white text-xl sm:text-2xl text-burgundy-900 shadow-sm hover:bg-burgundy-50 hover:border-burgundy-700 active:scale-95 transition"
            @click="insertLetter(letter)"
          >
            {{ letter }}
          </button>
        </div>

        <div class="flex flex-wrap gap-2 justify-center pt-1">
          <button
            type="button"
            class="px-4 h-11 sm:h-12 rounded-lg border text-sm font-semibold shadow-sm active:scale-95 transition"
            :class="capsLock
              ? 'bg-burgundy-700 border-burgundy-700 text-white'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-burgundy-50 hover:border-burgundy-700'"
            @click="toggleCapsLock"
          >
            Caps Lock
          </button>
          <button
            type="button"
            class="min-w-[8rem] h-11 sm:h-12 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-burgundy-50 hover:border-burgundy-700 active:scale-95 transition"
            @click="insertSpace"
          >
            Space
          </button>
          <button
            type="button"
            class="px-4 h-11 sm:h-12 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-burgundy-50 hover:border-burgundy-700 active:scale-95 transition"
            @click="backspace"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>

    <p class="text-center text-sm text-slate-600 mt-6">
      {{ capsLock ? 'Uppercase' : 'Lowercase' }} — toggle with Caps Lock.
    </p>
  </div>
</template>
