import { nextTick, ref } from 'vue'

/** Combining jinkim (grave accent, U+0300) — attaches to the previous letter. */
export const JINKIM = '\u0300'

/**
 * Coptic textarea helpers: insert / backspace at the caret.
 * @param {string} [initial]
 */
export function useCopticTextInput(initial = '') {
  const text = ref(initial)
  const textareaRef = ref(null)

  function focusAndSetCaret(pos) {
    nextTick(() => {
      const el = textareaRef.value
      if (!el) return
      el.focus()
      el.setSelectionRange(pos, pos)
    })
  }

  function insertAtCursor(value) {
    const el = textareaRef.value
    if (!el) {
      text.value += value
      return
    }
    const start = el.selectionStart ?? text.value.length
    const end = el.selectionEnd ?? text.value.length
    text.value = text.value.slice(0, start) + value + text.value.slice(end)
    focusAndSetCaret(start + value.length)
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
      focusAndSetCaret(start)
      return
    }
    if (start > 0) {
      text.value = text.value.slice(0, start - 1) + text.value.slice(start)
      focusAndSetCaret(start - 1)
    }
  }

  return { text, textareaRef, insertAtCursor, backspace }
}
