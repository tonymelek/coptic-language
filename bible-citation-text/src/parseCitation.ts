import { resolveBookName } from './books.js'
import type { ParsedCitation, VerseRange } from './types.js'

/**
 * Parse verse specs after `Chapter:`:
 * - `5` single verse
 * - `5-9` same-chapter range
 * - `5,6` / `5,6,8` discrete verses
 * - `12-2:10` cross-chapter
 */
function rangesFromVerseSpec(startChapter: number, verseSpec: string): VerseRange[] | null {
  const spec = verseSpec.trim()
  if (!spec) return null

  // Discrete verses: 3,6 or 3, 6, 8
  if (/^\d+(?:\s*,\s*\d+)+$/.test(spec)) {
    return spec.split(/\s*,\s*/).map((part) => {
      const verse = Number(part)
      return { chapter: startChapter, from: verse, to: verse }
    })
  }

  // Cross-chapter: 12-2:10
  const cross = spec.match(/^(\d+)-(\d+):(\d+)$/)
  if (cross) {
    const startVerse = Number(cross[1])
    const endChapter = Number(cross[2])
    const endVerse = Number(cross[3])
    const ranges: VerseRange[] = [
      { chapter: startChapter, from: startVerse, to: null },
    ]
    for (let chapter = startChapter + 1; chapter < endChapter; chapter += 1) {
      ranges.push({ chapter, from: 1, to: null })
    }
    ranges.push({ chapter: endChapter, from: 1, to: endVerse })
    return ranges
  }

  // Same-chapter range: 5-9
  const range = spec.match(/^(\d+)-(\d+)$/)
  if (range) {
    return [
      {
        chapter: startChapter,
        from: Number(range[1]),
        to: Number(range[2]),
      },
    ]
  }

  // Single verse: 5
  if (/^\d+$/.test(spec)) {
    const verse = Number(spec)
    return [{ chapter: startChapter, from: verse, to: verse }]
  }

  return null
}

/**
 * Parse a citation such as:
 * - `Psalms 122:5-6`
 * - `psalm122:5-6`
 * - `Psalms 145:3,6`
 * - `2 Timothy 1:12-2:10`
 */
export function parseCitation(citation: string): ParsedCitation | null {
  const trimmed = citation.trim()
  if (!trimmed) return null

  const match = trimmed.match(/^(.+?)(\d+)\s*:\s*(.+)$/)
  if (!match) return null

  const book = resolveBookName(match[1])
  if (!book) return null

  const chapter = Number(match[2])
  const ranges = rangesFromVerseSpec(chapter, match[3])
  if (!ranges) return null

  return { book, ranges }
}
