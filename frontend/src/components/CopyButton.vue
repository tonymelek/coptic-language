<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
})

const copied = ref(false)
let timer

const canCopy = computed(() => Boolean((props.text || '').trim()))

async function copy() {
  const value = (props.text || '').trim()
  if (!value) return

  try {
    await navigator.clipboard.writeText(value)
  } catch {
    const field = document.createElement('textarea')
    field.value = value
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.left = '-9999px'
    document.body.appendChild(field)
    field.select()
    document.execCommand('copy')
    field.remove()
  }

  copied.value = true
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    copied.value = false
  }, 1500)
}

onBeforeUnmount(() => {
  window.clearTimeout(timer)
})
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center min-h-11 px-3 rounded-md text-sm font-semibold text-burgundy-700 hover:bg-burgundy-50 disabled:cursor-not-allowed disabled:opacity-50"
    :disabled="!canCopy"
    @click="copy"
  >
    <span aria-live="polite">{{ copied ? 'Copied' : 'Copy' }}</span>
  </button>
</template>
