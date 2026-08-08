import { parseCitation } from './parseCitation.js'
import type {
  BibleLang,
  BibleText,
  BibleTextMap,
  ChapterCache,
  GetBibleTextOptions,
} from './types.js'

/** Public bilingual chapter assets (EN + AR), zero-padded chapter files. */
export const DEFAULT_BIBLE_BASE_URL = 'https://tonymelek.github.io/bible'

const DEFAULT_LANGS: BibleLang[] = ['en']

const EMPTY_TEXT: BibleText = { en: '', ar: '', versesEn: [], versesAr: [] }

/** Shared cache when `options.cache === true`. */
const sharedChapterCache: ChapterCache = new Map()

function padChapter(chapter: number): string {
  return String(chapter).padStart(2, '0')
}

function chapterCacheKey(
  baseUrl: string,
  lang: BibleLang,
  book: string,
  chapter: number,
): string {
  return `${baseUrl}|${lang}|${book}|${chapter}`
}

async function fetchChapter(
  baseUrl: string,
  lang: BibleLang,
  book: string,
  chapter: number,
): Promise<string[]> {
  const chapterFile = `${padChapter(chapter)}.json`
  const root = baseUrl.replace(/\/$/, '')
  const url = `${root}/${lang}/${encodeURIComponent(book)}/${chapterFile}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Bible chapter not found: ${lang}/${book}/${chapterFile}`)
  }
  return res.json() as Promise<string[]>
}

function loadChapter(
  baseUrl: string,
  lang: BibleLang,
  book: string,
  chapter: number,
  cache: ChapterCache,
): Promise<string[]> {
  const key = chapterCacheKey(baseUrl, lang, book, chapter)
  const existing = cache.get(key)
  if (existing) return existing

  const pending = fetchChapter(baseUrl, lang, book, chapter).catch((err) => {
    cache.delete(key)
    throw err
  })
  cache.set(key, pending)
  return pending
}

function versesFromChapter(
  chapterVerses: string[],
  from: number,
  to: number | null,
): string[] {
  const last = to ?? chapterVerses.length - 1
  const out: string[] = []
  for (let verse = from; verse <= last; verse += 1) {
    const text = chapterVerses[verse]
    if (typeof text === 'string' && text.length > 0) out.push(text)
  }
  return out
}

function resolveCache(cacheOption: GetBibleTextOptions['cache']): ChapterCache {
  if (cacheOption instanceof Map) return cacheOption
  if (cacheOption === true) return sharedChapterCache
  return new Map()
}

/** Clear the shared chapter cache used when `cache: true`. */
export function clearBibleCache(): void {
  sharedChapterCache.clear()
}

type ResolvedOptions = {
  baseUrl: string
  wantEn: boolean
  wantAr: boolean
  cache: ChapterCache
}

function resolveOptions(options: GetBibleTextOptions): ResolvedOptions {
  const langs = options.langs?.length ? options.langs : DEFAULT_LANGS
  return {
    baseUrl: options.baseUrl ?? DEFAULT_BIBLE_BASE_URL,
    wantEn: langs.includes('en'),
    wantAr: langs.includes('ar'),
    cache: resolveCache(options.cache),
  }
}

async function getBibleTextForRef(
  ref: string,
  resolved: ResolvedOptions,
): Promise<BibleText> {
  if (!ref) return { ...EMPTY_TEXT, versesEn: [], versesAr: [] }

  const { baseUrl, wantEn, wantAr, cache } = resolved
  const versesEn: string[] = []
  const versesAr: string[] = []
  const citations = ref
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)

  for (const citation of citations) {
    const parsed = parseCitation(citation)
    if (!parsed) {
      throw new Error(`Unrecognized Bible reference: "${citation}"`)
    }

    for (const range of parsed.ranges) {
      const [chapterEn, chapterAr] = await Promise.all([
        wantEn
          ? loadChapter(baseUrl, 'en', parsed.book, range.chapter, cache)
          : Promise.resolve([] as string[]),
        wantAr
          ? loadChapter(baseUrl, 'ar', parsed.book, range.chapter, cache)
          : Promise.resolve([] as string[]),
      ])

      if (wantEn) {
        versesEn.push(...versesFromChapter(chapterEn, range.from, range.to))
      }
      if (wantAr) {
        versesAr.push(...versesFromChapter(chapterAr, range.from, range.to))
      }
    }
  }

  return {
    en: versesEn.join(' '),
    ar: versesAr.join(' '),
    versesEn,
    versesAr,
  }
}

/**
 * Fetch Bible text for one reference string.
 *
 * @example
 * await getBibleText('Psalms 122:5-6')
 * await getBibleText('Matthew 18:1-9', { langs: ['en', 'ar'] })
 */
export async function getBibleText(
  ref: string,
  options?: GetBibleTextOptions,
): Promise<BibleText>

/**
 * Fetch Bible text for multiple refs; returns `{ [inputRef]: BibleText }`.
 *
 * @example
 * await getBibleText(['Psalms 122:5-6', 'Matthew 18:1-9'])
 * // { 'Psalms 122:5-6': { en, ar, ... }, 'Matthew 18:1-9': { ... } }
 */
export async function getBibleText(
  refs: string[],
  options?: GetBibleTextOptions,
): Promise<BibleTextMap>

export async function getBibleText(
  ref: string | string[],
  options: GetBibleTextOptions = {},
): Promise<BibleText | BibleTextMap> {
  const resolved = resolveOptions(options)

  if (Array.isArray(ref)) {
    const out: BibleTextMap = {}
    for (const inputRef of ref) {
      out[inputRef] = await getBibleTextForRef(String(inputRef ?? ''), resolved)
    }
    return out
  }

  if (!ref || typeof ref !== 'string') {
    return { ...EMPTY_TEXT, versesEn: [], versesAr: [] }
  }

  return getBibleTextForRef(ref, resolved)
}
