/** Canonical folder names under the public Bible assets. */
export const BIBLE_BOOKS = [
  'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Deuteronomy',
  'Joshua',
  'Judges',
  'Ruth',
  '1 Samuel',
  '2 Samuel',
  '1 Kings',
  '2 Kings',
  '1 Chronicles',
  '2 Chronicles',
  'Ezra',
  'Nehemiah',
  'Esther',
  'Job',
  'Psalms',
  'Proverbs',
  'Ecclesiastes',
  'Song of Solomon',
  'Isaiah',
  'Jeremiah',
  'Lamentations',
  'Ezekiel',
  'Daniel',
  'Hosea',
  'Joel',
  'Amos',
  'Obadiah',
  'Jonah',
  'Micah',
  'Nahum',
  'Habakkuk',
  'Zephaniah',
  'Haggai',
  'Zechariah',
  'Malachi',
  'Matthew',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Romans',
  '1 Corinthians',
  '2 Corinthians',
  'Galatians',
  'Ephesians',
  'Philippians',
  'Colossians',
  '1 Thessalonians',
  '2 Thessalonians',
  '1 Timothy',
  '2 Timothy',
  'Titus',
  'Philemon',
  'Hebrews',
  'James',
  '1 Peter',
  '2 Peter',
  '1 John',
  '2 John',
  '3 John',
  'Jude',
  'Revelation',
] as const

const BOOK_ALIASES: Record<string, string> = {
  psalm: 'Psalms',
  psalms: 'Psalms',
  songofsolomon: 'Song of Solomon',
  songofsongs: 'Song of Solomon',
  canticles: 'Song of Solomon',
  apocalypse: 'Revelation',
}

const bookByKey = new Map<string, string>()
for (const book of BIBLE_BOOKS) {
  bookByKey.set(normalizeKey(book), book)
}
for (const [alias, book] of Object.entries(BOOK_ALIASES)) {
  bookByKey.set(alias, book)
}

function normalizeKey(value: string): string {
  return value.replace(/[\s._-]+/g, '').toLowerCase()
}

/** Map free-form book labels (`psalm`, `1Corinthians`, `Song of Solomon`) to asset folder names. */
export function resolveBookName(raw: string): string | null {
  const key = normalizeKey(raw)
  if (!key) return null
  return bookByKey.get(key) ?? null
}
