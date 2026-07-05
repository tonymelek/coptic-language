const INDEX_FILES = {
  copticWord: 'copticWord.json',
  transliteration: 'transliteration.json',
  meaning: 'definition.json',
}

const indexCache = new Map()
const pageCache = new Map()

function baseUrl() {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

function normalize(value) {
  return (value || '').trim()
}

function normalizeLower(value) {
  return normalize(value).toLowerCase()
}

async function loadIndex(mode) {
  if (indexCache.has(mode)) {
    return indexCache.get(mode)
  }

  const file = INDEX_FILES[mode]
  const response = await fetch(`${baseUrl()}dictionary_index/${file}`)
  if (!response.ok) {
    throw new Error(`Failed to load dictionary index (${response.status})`)
  }

  const data = await response.json()
  indexCache.set(mode, data)
  return data
}

function includesMatch(value, query) {
  const haystack = normalizeLower(value)
  const needle = normalizeLower(query)
  if (!haystack || !needle) return false
  return haystack.includes(needle)
}

function lookupPages(index, query) {
  const needle = normalizeLower(query)
  if (!needle) {
    return { keys: [], pageIds: [] }
  }

  const keys = Object.keys(index).filter((key) => key.toLowerCase().includes(needle))
  const pageIds = [...new Set(keys.flatMap((key) => index[key] || []))]
  return { keys, pageIds }
}

async function loadPage(pageId) {
  if (pageCache.has(pageId)) {
    return pageCache.get(pageId)
  }

  const response = await fetch(`${baseUrl()}dictionary_pages/${pageId}.json`)
  if (!response.ok) {
    throw new Error(`Failed to load page ${pageId} (${response.status})`)
  }

  const data = await response.json()
  const entries = Array.isArray(data) ? data : data.entries || []
  pageCache.set(pageId, entries)
  return entries
}

function entryTextValues(entry) {
  const values = [entry.gloss, entry.definition]

  for (const sense of entry.senses || []) {
    values.push(sense.gloss, sense.definition)
  }

  return values.filter(Boolean)
}

function entryMatchesCopticWord(entry, query) {
  if (includesMatch(entry.copticWord, query)) return true

  return (entry.variants || []).some((variant) => includesMatch(variant.copticWord, query))
}

function entryMatchesTransliteration(entry, query) {
  if (includesMatch(entry.englishTransliteration, query)) return true
  if (includesMatch(entry.headword, query)) return true

  return (entry.variants || []).some((variant) => {
    return (
      includesMatch(variant.englishTransliteration, query) ||
      includesMatch(variant.word, query)
    )
  })
}

function entryMatchesMeaning(entry, query) {
  return entryTextValues(entry).some((value) => includesMatch(value, query))
}

function entryMatches(entry, mode, query) {
  if (mode === 'copticWord') return entryMatchesCopticWord(entry, query)
  if (mode === 'transliteration') return entryMatchesTransliteration(entry, query)
  return entryMatchesMeaning(entry, query)
}

export const SEARCH_MODES = [
  { id: 'copticWord', label: 'Coptic word' },
  { id: 'transliteration', label: 'Transliteration' },
  { id: 'meaning', label: 'Meaning' },
]

export async function searchDictionary(mode, query) {
  const index = await loadIndex(mode)
  const { pageIds } = lookupPages(index, query)

  if (!pageIds.length) {
    return []
  }

  const pages = await Promise.all(pageIds.map((pageId) => loadPage(pageId)))
  const results = []

  for (let i = 0; i < pageIds.length; i += 1) {
    const pageId = pageIds[i]
    for (const entry of pages[i]) {
      if (entryMatches(entry, mode, query)) {
        results.push({ entry, pageId })
      }
    }
  }

  return results
}
