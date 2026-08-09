import { nextTick, ref } from 'vue'

/** Combining jinkim (grave accent, U+0300) — attaches to the previous letter. */
export const JINKIM = '\u0300'

/**
 * Coptic text-field helpers: insert / backspace at the caret.
 * Tracks caret separately so inserts still work when a bottom-sheet keyboard
 * steals focus from a readonly mobile input.
 * @param {string} [initial]
 */
export function useCopticTextInput(initial = '') {
  const text = ref(initial)
  const textareaRef = ref(null)
  /** Fallback caret when the field is blurred (common with the modal keyboard). */
  const caret = ref(initial.length)

  function readSelection() {
    const el = textareaRef.value
    if (!el || typeof el.selectionStart !== 'number') {
      return { start: caret.value, end: caret.value }
    }
    return {
      start: el.selectionStart,
      end: el.selectionEnd ?? el.selectionStart,
    }
  }

  function syncCaretFromEl() {
    const el = textareaRef.value
    if (!el || typeof el.selectionStart !== 'number') return
    caret.value = el.selectionStart
  }

  function focusAndSetCaret(pos) {
    caret.value = pos
    nextTick(() => {
      const el = textareaRef.value
      if (!el) return
      try {
        el.focus({ preventScroll: true })
        el.setSelectionRange(pos, pos)
      } catch {
        // Some mobile browsers reject setSelectionRange on unfocused/readonly fields.
      }
    })
  }

  function insertAtCursor(value) {
    const el = textareaRef.value
    const { start, end } =
      el && document.activeElement === el
        ? readSelection()
        : { start: caret.value, end: caret.value }

    text.value = text.value.slice(0, start) + value + text.value.slice(end)
    focusAndSetCaret(start + value.length)
  }

  function backspace() {
    const el = textareaRef.value
    const { start, end } =
      el && document.activeElement === el
        ? readSelection()
        : { start: caret.value, end: caret.value }

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

  return {
    text,
    textareaRef,
    caret,
    insertAtCursor,
    backspace,
    syncCaretFromEl,
    focusAndSetCaret,
  }
}
