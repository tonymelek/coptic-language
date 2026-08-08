<script setup>
import CopticKeyboard from '../components/CopticKeyboard.vue'
import { useCopticTextInput } from '../composables/useCopticTextInput.js'

const { text, textareaRef, insertAtCursor, backspace } = useCopticTextInput('')
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

      <CopticKeyboard
        :show-close="false"
        class="!rounded-xl !border !border-b !shadow-none"
        @insert="insertAtCursor"
        @backspace="backspace"
      />
    </div>

    <p class="text-center text-sm text-slate-600 mt-6">
      Type a letter, then <span class="font-semibold">Jinkim</span> to add the mark (e.g. ⲡ̀).
    </p>
  </div>
</template>
