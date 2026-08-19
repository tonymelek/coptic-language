<script setup>
import { computed, nextTick, ref } from 'vue'
import { COPTIC_LETTER_PAIRS } from '../copticLetters.js'
import { JINKIM } from '../composables/useCopticTextInput.js'

const props = defineProps({
  /** Show the Hide control (for bottom-sheet usage). */
  showClose: { type: Boolean, default: true },
  /**
   * Live editable text above the keys so typing stays visible / caret can
   * be placed mid-word when the sheet covers the original field.
   * Omit on the Write page.
   */
  preview: { type: String, default: undefined },
  previewPlaceholder: { type: String, default: 'Type Coptic…' },
  /** Tracked caret offset into `preview`. */
  caret: { type: Number, default: 0 },
})

const emit = defineEmits(['insert', 'backspace', 'close', 'caret-change', 'preview-ready'])

const capsLock = ref(false)
const previewInputRef = ref(null)

const letters = computed(() =>
  COPTIC_LETTER_PAIRS.map(([upper, lower]) => (capsLock.value ? upper : lower)),
)

/**
 * Act on pointerdown (mouse + touch). preventDefault keeps focus on the
 * preview field — using touchstart.prevent + click fails on mobile because
 * prevented touchstarts suppress the synthetic click.
 */
function onKey(e, action) {
  e.preventDefault()
  action()
}

function toggleCapsLock() {
  capsLock.value = !capsLock.value
}

function emitCaretFromPreview() {
  const el = previewInputRef.value
  if (!el || typeof el.selectionStart !== 'number') return
  emit('caret-change', {
    start: el.selectionStart,
    end: el.selectionEnd ?? el.selectionStart,
  })
}

function restorePreviewCaret() {
  const el = previewInputRef.value
  if (!el || props.preview === undefined) return
  const len = props.preview.length
  const start = Math.max(0, Math.min(props.caret, len))
  nextTick(() => {
    try {
      el.focus({ preventScroll: true })
      el.setSelectionRange(start, start)
    } catch {
      // ignore
    }
  })
}

defineExpose({
  previewInputRef,
  focusPreview: restorePreviewCaret,
})

nextTick(() => {
  if (props.preview !== undefined) {
    emit('preview-ready', previewInputRef.value)
    restorePreviewCaret()
  }
})
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
        class="shrink-0 px-3 min-h-11 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-burgundy-50 hover:border-burgundy-700 active:scale-95 transition"
        @pointerdown="onKey($event, () => emit('close'))"
      >
        Hide
      </button>
    </div>

    <div v-if="preview !== undefined" class="mx-3 sm:mx-4 mb-2">
      <label class="sr-only" for="coptic-keyboard-preview">Typed Coptic text</label>
      <textarea
        id="coptic-keyboard-preview"
        ref="previewInputRef"
        :value="preview"
        rows="2"
        readonly
        inputmode="none"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        dir="auto"
        class="w-full rounded-lg border border-burgundy-200 bg-white px-3 py-2.5 font-coptic text-xl sm:text-2xl text-burgundy-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent resize-none whitespace-pre-wrap break-words caret-burgundy-700 cursor-text"
        :placeholder="previewPlaceholder"
        @select="emitCaretFromPreview"
        @keyup="emitCaretFromPreview"
        @click="emitCaretFromPreview"
        @mouseup="emitCaretFromPreview"
        @focus="emitCaretFromPreview"
        @touchend="emitCaretFromPreview"
      />
      <p class="mt-1 text-[11px] text-slate-500">
        Tap in the text to place the cursor, then use the keys.
      </p>
    </div>

    <div class="px-3 sm:px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-2">
      <div class="flex flex-wrap gap-2 justify-center">
        <button
          v-for="(letter, index) in letters"
          :key="index"
          type="button"
          class="font-coptic min-w-11 h-11 sm:h-12 px-1 rounded-lg border border-slate-300 bg-white text-xl sm:text-2xl text-burgundy-900 shadow-sm hover:bg-burgundy-50 hover:border-burgundy-700 active:scale-95 transition select-none touch-manipulation"
          @pointerdown="onKey($event, () => emit('insert', letter))"
        >
          {{ letter }}
        </button>
      </div>

      <div class="flex flex-wrap gap-2 justify-center pt-1">
        <button
          type="button"
          class="px-4 min-h-11 sm:min-h-12 rounded-lg border text-sm font-semibold shadow-sm active:scale-95 transition select-none touch-manipulation"
          :aria-pressed="capsLock"
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
          class="px-3 min-h-11 sm:min-h-12 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-burgundy-50 hover:border-burgundy-700 active:scale-95 transition inline-flex items-center gap-1.5 select-none touch-manipulation"
          @pointerdown="onKey($event, () => emit('insert', JINKIM))"
        >
          <span class="font-coptic text-xl leading-none" aria-hidden="true">ⲁ̀</span>
          <span>Jinkim</span>
        </button>
        <button
          type="button"
          class="min-w-[8rem] min-h-11 sm:min-h-12 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-burgundy-50 hover:border-burgundy-700 active:scale-95 transition select-none touch-manipulation"
          @pointerdown="onKey($event, () => emit('insert', ' '))"
        >
          Space
        </button>
        <button
          type="button"
          aria-label="Backspace"
          class="inline-flex items-center justify-center px-4 min-h-11 sm:min-h-12 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-burgundy-50 hover:border-burgundy-700 active:scale-95 transition select-none touch-manipulation"
          @pointerdown="onKey($event, () => emit('backspace'))"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l3.44-6.12A2 2 0 018.2 5h9.3A2.5 2.5 0 0120 7.5v9a2.5 2.5 0 01-2.5 2.5H8.2a2 2 0 01-1.76-.88L3 12z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
