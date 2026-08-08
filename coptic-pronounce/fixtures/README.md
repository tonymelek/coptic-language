# Golden fixtures

Trusted liturgical hymn JSON used to score `coptic-pronounce` against real
`coptic` → `copticEnglish` / `arabicCoptic` pairs.

| File | Source |
|------|--------|
| `01-0_ten_thino.json` | Psalmody `frontend/src/assets/hymns/indexedHymns/` |
| `03-0_first_hoos.json` | Psalmody `backend/indexedHymns/` |

## Run

```bash
npm run harness          # English (default)
npm run harness:ar       # Arabic
npm run harness:verbose  # print every English line
```

Optional gate:

```bash
node scripts/golden-harness.mjs --lang en --min-score 0.90
```

## Scoring

- **exact** — raw string match
- **normalized** — case/punct/hyphen-insensitive match
- **avg similarity** — Levenshtein ratio on normalized strings

Editorial hyphenation and occasional word-splits in the goldens (e.g. `Ⲧⲉⲛⲑⲏⲛⲟⲩ` → `Ten theno`) mean exact/normalized rates stay below 100%; similarity is the main quality signal.

Phonetic spelling variants that sound the same are treated as equal when scoring:

- **English:** `y`→`i` (e.g. `efiom` ≈ `efyom`), hyphens ignored
- **Arabic:** `أ/إ/آ`→`ا`, `ى`→`ي`, `ؤ`→`و`, `ئ`→`ي`, `ة`→`ه`, `ڤ`→`ف`, **spaces ignored**
