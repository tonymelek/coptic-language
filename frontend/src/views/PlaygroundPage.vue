<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import {
  DEMOS,
  FORMATS,
  getSnippet,
  runPlayground,
} from '../lib/playground.js'

const demoId = ref('antonios')
const formatId = ref('mjs')
const code = ref(getSnippet('antonios', 'mjs'))
const output = ref('Press Run to execute against the real packages.')
const ok = ref(true)
const running = ref(false)
const dirty = ref(false)
const editorEl = ref(null)

const activeDemo = computed(
  () => DEMOS.find((d) => d.id === demoId.value) ?? DEMOS[0],
)

const fileLabel = computed(() => {
  const ext = FORMATS.find((f) => f.id === formatId.value)?.ext ?? 'mjs'
  return `playground.${ext}`
})

watch([demoId, formatId], () => {
  if (!dirty.value) {
    code.value = getSnippet(demoId.value, formatId.value)
  }
})

function selectDemo(id) {
  dirty.value = false
  demoId.value = id
  code.value = getSnippet(id, formatId.value)
}

function selectFormat(id) {
  dirty.value = false
  formatId.value = id
  code.value = getSnippet(demoId.value, id)
}

function onEdit() {
  dirty.value = true
}

function reset() {
  dirty.value = false
  code.value = getSnippet(demoId.value, formatId.value)
  output.value = 'Press Run to execute against the real packages.'
  ok.value = true
}

async function run() {
  running.value = true
  output.value = 'Running…'
  ok.value = true
  await nextTick()
  const result = await runPlayground(code.value)
  ok.value = result.ok
  output.value = result.output
  running.value = false
}
</script>

<template>
  <div class="playground max-w-6xl mx-auto px-4 py-10 sm:px-6">
    <div class="mb-8 max-w-2xl">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Packages</p>
      <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-burgundy-900 sm:text-4xl">
        Playground
      </h1>
      <p class="mt-3 text-slate-700 leading-relaxed">
        Edit real snippets for
        <span class="text-burgundy-700 font-semibold">coptic-antonios-unicode</span>
        and
        <span class="text-burgundy-700 font-semibold">coptic-pronounce</span>,
        then Run — output comes from the installed packages, not mocks.
        Switch between <code class="bg-burgundy-50 px-1 rounded font-mono text-sm">.mjs</code>
        and <code class="bg-burgundy-50 px-1 rounded font-mono text-sm">.cjs</code>
        (packages also ship TypeScript types for your own projects).
      </p>
      <div class="w-12 h-1 bg-gold mt-4 rounded-full"></div>
    </div>

    <div
      class="mb-4 flex flex-wrap gap-2"
      role="group"
      aria-label="Demo"
    >
      <button
        v-for="demo in DEMOS"
        :key="demo.id"
        type="button"
        class="playground-chip"
        :class="{ 'is-active': demoId === demo.id }"
        :aria-pressed="demoId === demo.id"
        @click="selectDemo(demo.id)"
      >
        {{ demo.label }}
      </button>
    </div>
    <p class="mb-6 text-sm text-slate-600">
      {{ activeDemo.blurb }}
    </p>

    <div class="playground-stage">
      <div class="playground-pane">
        <div class="playground-toolbar">
          <div
            class="flex flex-wrap gap-1"
            role="group"
            aria-label="Module format"
          >
            <button
              v-for="fmt in FORMATS"
              :key="fmt.id"
              type="button"
              class="playground-tab"
              :class="{ 'is-active': formatId === fmt.id }"
              :aria-pressed="formatId === fmt.id"
              @click="selectFormat(fmt.id)"
            >
              {{ fmt.label }}
            </button>
          </div>
          <span class="playground-file">{{ fileLabel }}</span>
        </div>

        <label class="sr-only" for="playground-code">Code editor</label>
        <textarea
          id="playground-code"
          ref="editorEl"
          v-model="code"
          class="playground-editor"
          spellcheck="false"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          rows="16"
          @input="onEdit"
        />

        <div class="playground-actions">
          <button
            type="button"
            class="btn-run"
            :disabled="running"
            @click="run"
          >
            {{ running ? 'Running…' : 'Run' }}
          </button>
          <button
            type="button"
            class="btn-ghost"
            :disabled="running"
            @click="reset"
          >
            Reset
          </button>
          <a
            href="/packages.html"
            class="ms-auto text-sm text-slate-400 no-underline transition hover:text-gold"
          >
            Install snippets →
          </a>
        </div>
      </div>

      <div class="playground-pane playground-pane--out">
        <div class="playground-toolbar">
          <span class="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            Output
          </span>
          <span
            class="text-xs"
            :class="ok ? 'text-slate-400' : 'text-red-300'"
          >
            {{ ok ? 'console' : 'error' }}
          </span>
        </div>
        <pre
          class="playground-output"
          :class="{ 'is-error': !ok }"
          aria-live="polite"
        >{{ output }}</pre>
      </div>
    </div>

    <p class="mt-6 text-sm text-slate-600">
      Tip: change the Antonios string or Coptic text, then Run again.
      Imports are provided for you in this sandbox.
    </p>
  </div>
</template>
