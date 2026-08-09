<script setup>
import { computed, ref } from 'vue'
import { COPTIC_LETTER_PAIRS } from '../copticLetters.js'
import { JINKIM } from '../composables/useCopticTextInput.js'

defineProps({
  /** Show the Hide control (for bottom-sheet usage). */
  showClose: { type: Boolean, default: true },
})

const emit = defineEmits(['insert', 'backspace', 'close'])

const capsLock = ref(false)

const letters = computed(() =>
  COPTIC_LETTER_PAIRS.map(([upper, lower]) => (capsLock.value ? upper : lower)),
)

/**
 * Act on pointerdown (mouse + touch). preventDefault keeps focus on the
 * text field — using touchstart.prevent + click fails on mobile because
 * prevented touchstarts suppress the synthetic click.
 */
function onKey(e, action) {
  e.preventDefault()
  action()
}

function toggleCapsLock() {
  capsLock.value = !capsLock.value
}
</script>

<template>
  <div class="rounded-t-2xl border border-slate-200 border-b-0 bg-slate-50 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
    <div class="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
      <div class="min-w-0">
        <div
          v-if="showClose"
          class="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-300 sm:mx-0"
          aria-hidden="true"
        />
        <div class="flex items-baseline gap-2">
          <span class="text-sm font-semibold text-burgundy-900">Coptic keyboard</span>
          <span class="text-xs text-slate-500">{{ capsLock ? 'Uppercase' : 'Lowercase' }}</span>
        </div>
      </div>
      <button
        v-if="showClose"
        type="button"
        class="shrink-0 px-3 h-9 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-burgundy-50 hover:border-burgundy-700 active:scale-95 transition"
        @pointerdown="onKey($event, () => emit('close'))"
      >
        Hide
      </button>
    </div>

    <div class="px-3 sm:px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-2">
      <div class="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
        <button
          v-for="(letter, index) in letters"
          :key="index"
          type="button"
          class="font-coptic min-w-[2.5rem] h-11 sm:h-12 px-1 rounded-lg border border-slate-300 bg-white text-xl sm:text-2xl text-burgundy-900 shadow-sm hover:bg-burgundy-50 hover:border-burgundy-700 active:scale-95 transition select-none touch-manipulation"
          @pointerdown="onKey($event, () => emit('insert', letter))"
        >
          {{ letter }}
        </button>
      </div>

      <div class="flex flex-wrap gap-2 justify-center pt-1">
        <button
          type="button"
          class="px-4 h-11 sm:h-12 rounded-lg border text-sm font-semibold shadow-sm active:scale-95 transition select-none touch-manipulation"
          :class="capsLock
            ? 'bg-burgundy-700 border-burgundy-700 text-white'
            : 'bg-white border-slate-300 text-slate-700 hover:bg-burgundy-50 hover:border-burgundy-700'"
          @pointerdown="onKey($event, toggleCapsLock)"
        >
          Caps Lock
        </button>
        <button
          type="button"
          title="Insert jinkim (combining grave)"
          class="px-3 h-11 sm:h-12 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-burgundy-50 hover:border-burgundy-700 active:scale-95 transition inline-flex items-center gap-1.5 select-none touch-manipulation"
          @pointerdown="onKey($event, () => emit('insert', JINKIM))"
        >
          <span class="font-coptic text-xl leading-none" aria-hidden="true">ⲁ̀</span>
          <span>Jinkim</span>
        </button>
        <button
          type="button"
          class="min-w-[8rem] h-11 sm:h-12 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-burgundy-50 hover:border-burgundy-700 active:scale-95 transition select-none touch-manipulation"
          @pointerdown="onKey($event, () => emit('insert', ' '))"
        >
          Space
        </button>
        <button
          type="button"
          class="px-4 h-11 sm:h-12 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-burgundy-50 hover:border-burgundy-700 active:scale-95 transition select-none touch-manipulation"
          @pointerdown="onKey($event, () => emit('backspace'))"
        >
          ⌫
        </button>
      </div>
    </div>
  </div>
</template>
