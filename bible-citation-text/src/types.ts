export type BibleLang = 'en' | 'ar'

export type BibleText = {
  /** Joined English verse text (empty when `en` is not in `langs`) */
  en: string
  /** Joined Arabic verse text (empty when `ar` is not in `langs`) */
  ar: string
  /** Individual English verses in order */
  versesEn: string[]
  /** Individual Arabic verses in order */
  versesAr: string[]
}

/** Map of input ref → text when `getBibleText` is called with `string[]`. */
export type BibleTextMap = Record<string, BibleText>

export type VerseRange = {
  chapter: number
  from: number
  /** `null` means through end of chapter */
  to: number | null
}

export type ParsedCitation = {
  book: string
  ranges: VerseRange[]
}

/** Shared chapter fetch cache: key → chapter verse array promise */
export type ChapterCache = Map<string, Promise<string[]>>

export type GetBibleTextOptions = {
  /** Override chapter asset host. Default: https://tonymelek.github.io/bible */
  baseUrl?: string
  /**
   * Languages to fetch. Default: `['en']`.
   * Only requested langs are fetched and returned.
   */
  langs?: BibleLang[]
  /**
   * Limit network fetches by caching chapter JSON.
   * - `true` — use the package shared cache
   * - `Map` — use your own cache (e.g. per session)
   * Within a single call, duplicate chapter/lang pairs are always deduped.
   */
  cache?: boolean | ChapterCache
}
