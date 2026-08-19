import { nextTick, ref } from 'vue'

/** Combining jinkim (grave accent, U+0300) — attaches to the previous letter. */
export const JINKIM = '\u0300'

/** True on phones / tablets where the OS soft keyboard should yield to Coptic keys. */
export function isCoarsePointer() {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)
  )
}

/**
 * Coptic text-field helpers: insert / backspace at a tracked caret.
 * Caret is the source of truth (needed when a bottom-sheet keyboard blurs
 * the main field or iOS resets selectionStart to 0 on readonly inputs).
 * @param {string} [initial]
 */
export function useCopticTextInput(initial = '') {
  const text = ref(initial)
  const textareaRef = ref(null)
  /** Optional preview field inside the bottom-sheet keyboard. */
  const previewRef = ref(null)
  const caret = ref(initial.length)
  const selectionEnd = ref(initial.length)

  function clamp(pos) {
    return Math.max(0, Math.min(pos, text.value.length))
  }

  function setSelection(start, end = start) {
    const s = clamp(start)
    const e = clamp(end)
    caret.value = s
    selectionEnd.value = e
  }

  function syncCaretFromEl(el = textareaRef.value) {
    if (!el || typeof el.selectionStart !== 'number') return
    setSelection(el.selectionStart, el.selectionEnd ?? el.selectionStart)
  }

  /** Apply tracked caret to whichever editing surface is available. */
  function applyCaretToFields() {
    const start = clamp(caret.value)
    const end = clamp(selectionEnd.value)
    caret.value = start
    selectionEnd.value = end

    nextTick(() => {
      const targets = [previewRef.value, textareaRef.value].filter(Boolean)
      for (const el of targets) {
        try {
          el.setSelectionRange(start, end)
        } catch {
          // Some mobile browsers reject setSelectionRange when not focused.
        }
      }
      const preferred = previewRef.value || textareaRef.value
      try {
        preferred?.focus({ preventScroll: true })
        preferred?.setSelectionRange(start, end)
      } catch {
        // ignore
      }
    })
  }

  function focusPreview() {
    nextTick(() => {
      const el = previewRef.value
      if (!el) return
      const start = clamp(caret.value)
      const end = clamp(selectionEnd.value)
      try {
        el.focus({ preventScroll: true })
        el.setSelectionRange(start, end)
      } catch {
        // ignore
      }
    })
  }

  /** Move caret to end of text (safe default when opening the sheet). */
  function moveCaretToEnd() {
    const end = text.value.length
    setSelection(end, end)
  }

  function insertAtCursor(value) {
    const start = clamp(Math.min(caret.value, selectionEnd.value))
    const end = clamp(Math.max(caret.value, selectionEnd.value))
    text.value = text.value.slice(0, start) + value + text.value.slice(end)
    const next = start + value.length
    setSelection(next, next)
    applyCaretToFields()
  }

  function backspace() {
    const start = clamp(Math.min(caret.value, selectionEnd.value))
    const end = clamp(Math.max(caret.value, selectionEnd.value))

    if (start !== end) {
      text.value = text.value.slice(0, start) + text.value.slice(end)
      setSelection(start, start)
      applyCaretToFields()
      return
    }
    if (start > 0) {
      text.value = text.value.slice(0, start - 1) + text.value.slice(start)
      setSelection(start - 1, start - 1)
      applyCaretToFields()
    }
  }

  return {
    text,
    textareaRef,
    previewRef,
    caret,
    selectionEnd,
    insertAtCursor,
    backspace,
    syncCaretFromEl,
    setSelection,
    moveCaretToEnd,
    focusPreview,
    applyCaretToFields,
  }
}
