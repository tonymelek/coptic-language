/**
 * Psalm chapter numbering helpers.
 *
 * `psalm` in data files uses Masoretic (MT / NKJV) chapters for bible-citation-text lookup.
 * `psalm_coptic_ref` uses Septuagint / Coptic chapters for liturgical display.
 *
 * Verse numbers are left unchanged: editions sometimes differ inside a psalm;
 * chapter mapping is the stable Coptic-vs-MT distinction for UI labels.
 */

/** MT (Hebrew) chapter → LXX / Coptic chapter. */
export function mtToLxxChapter(ch: number): number {
  if (ch >= 1 && ch <= 8) return ch
  if (ch === 9 || ch === 10) return 9
  if (ch >= 11 && ch <= 113) return ch - 1
  if (ch === 114 || ch === 115) return 113
  if (ch === 116) return 114
  if (ch >= 117 && ch <= 146) return ch - 1
  if (ch === 147) return 146
  return ch
}

/** LXX / Coptic chapter → MT chapter (first MT chapter when LXX spans two). */
export function lxxToMtChapter(ch: number): number {
  if (ch >= 1 && ch <= 8) return ch
  if (ch === 9) return 9
  if (ch >= 10 && ch <= 112) return ch + 1
  if (ch === 113) return 114
  if (ch === 114 || ch === 115) return 116
  if (ch >= 116 && ch <= 145) return ch + 1
  if (ch === 146 || ch === 147) return 147
  return ch
}

/**
 * Convert an MT lookup citation to a Coptic-display citation.
 * Handles `;`-separated multi-psalm refs and keeps verse specs as-is.
 *
 * @example mtPsalmToCopticRef('Psalms 33:20,21') // 'Psalms 32:20,21'
 * @example mtPsalmToCopticRef('Psalms 6:1;Psalms 38:15') // 'Psalms 6:1;Psalms 37:15'
 */
export function mtPsalmToCopticRef(citation: string): string {
  return citation
    .split(';')
    .map((part) => {
      const trimmed = part.trim()
      const m = trimmed.match(/^(Psalms?)\s+(\d+)\s*:\s*(.+)$/i)
      if (!m) return trimmed
      const book = m[1].toLowerCase().startsWith('psalm') ? 'Psalms' : m[1]
      const lxx = mtToLxxChapter(Number(m[2]))
      return `${book} ${lxx}:${m[3].trim()}`
    })
    .join(';')
}
