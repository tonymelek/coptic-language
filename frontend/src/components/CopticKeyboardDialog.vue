<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import CopticKeyboard from './CopticKeyboard.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  preview: { type: String, default: '' },
  caret: { type: Number, default: 0 },
  previewPlaceholder: { type: String, default: 'Type Coptic…' },
})

const emit = defineEmits(['close', 'insert', 'backspace', 'caret-change', 'preview-ready'])

const dialogRef = ref(null)
const keyboardRef = ref(null)
const previouslyFocused = ref(null)

const FOCUSABLE =
  'button:not([disabled]), [href], textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusables() {
  return [...(dialogRef.value?.querySelectorAll(FOCUSABLE) ?? [])]
}

function onKeydown(event) {
  if (!props.open) return

  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }

  if (event.key !== 'Tab') return

  const nodes = focusables()
  if (!nodes.length) return

  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  const active = document.activeElement

  if (event.shiftKey && (active === first || !dialogRef.value?.contains(active))) {
    event.preventDefault()
    last.focus()
    return
  }

  if (!event.shiftKey && (active === last || !dialogRef.value?.contains(active))) {
    event.preventDefault()
    first.focus()
  }
}

function restoreFocus() {
  const el = previouslyFocused.value
  previouslyFocused.value = null
  if (!el || typeof el.focus !== 'function') return
  try {
    el.focus({ preventScroll: true })
  } catch {
    el.focus()
  }
}

watch(
  () => props.open,
  async (open) => {
    document.body.classList.toggle('overflow-hidden', open)

    if (open) {
      previouslyFocused.value = document.activeElement
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      keyboardRef.value?.focusPreview?.()
      return
    }

    document.removeEventListener('keydown', onKeydown)
    restoreFocus()
  },
)

onBeforeUnmount(() => {
  document.body.classList.remove('overflow-hidden')
  document.removeEventListener('keydown', onKeydown)
})

defineExpose({
  get previewInputRef() {
    return keyboardRef.value?.previewInputRef ?? null
  },
  focusPreview() {
    keyboardRef.value?.focusPreview?.()
  },
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="dialogRef"
      class="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-label="Coptic on-screen keyboard"
    >
      <div
        class="absolute inset-0 bg-burgundy-900/30"
        aria-hidden="true"
        @click="emit('close')"
      />
      <div class="keyboard-sheet absolute inset-x-0 bottom-0 max-w-3xl mx-auto">
        <CopticKeyboard
          ref="keyboardRef"
          :preview="preview"
          :caret="caret"
          :preview-placeholder="previewPlaceholder"
          @insert="emit('insert', $event)"
          @backspace="emit('backspace')"
          @close="emit('close')"
          @caret-change="emit('caret-change', $event)"
          @preview-ready="emit('preview-ready', $event)"
        />
      </div>
    </div>
  </Teleport>
</template>
