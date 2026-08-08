# coptic-pronounce

[![npm version](https://img.shields.io/npm/v/coptic-pronounce.svg)](https://www.npmjs.com/package/coptic-pronounce)

Phonetic transliteration of **Coptic Unicode** text into **English** and **Arabic** script (Bohairic liturgical pronunciation), plus a **reverse guess** engine from Latin/Arabic phonetics back to Coptic.

Handles jenkim epenthesis (`ⲛ̀` → `en`), digraphs (`ⲟⲩ` → `ou`, `ⲟⲩⲓ` → `owi`), and liturgical forms (`Ⲡ̀ϭⲟⲓⲥ` → `Epshois`).

## Install

```bash
npm install coptic-pronounce
```

## Usage

### Coptic → English / Arabic

```js
import { pronounce, guessCoptic, toCoptic } from 'coptic-pronounce';

pronounce('Ⲡ̀ϭⲟⲓⲥ', 'en'); // Epshois
pronounce('Ⲡ̀ϭⲟⲓⲥ', 'ar'); // إبشويس
```

### Latin / Arabic → Coptic (best-effort guess)

```js
guessCoptic('Epshois', 'en');
// { best: 'Ⲡ̀ϭⲟⲓⲥ', candidates: [...] }

guessCoptic('إبشويس', 'ar').best;
// Ⲡ̀ϭⲟⲓⲥ

toCoptic('Shere ne Maria', 'en');
// ⲭ̅ⲉ̅

toCoptic('شيرى نى ماريا', 'ar');
// ⲭ̅ⲉ̅
```

Reverse mapping is **ambiguous** by nature (`f` → `ϥ`|`ⲫ`, `i` → `ⲓ`|`ⲏ`). The engine returns a ranked `candidates` list; `best` is the top Bohairic-liturgical guess.

`lang` / `from` accepts `'en'`, `'ar'`, `'english'`, or `'arabic'`.

Leading `+` markers and punctuation are allowed. Non-Coptic letters in the first Coptic word are rejected.

```js
pronounce('hello', 'en');
// Error: Expected Coptic Unicode text; found "h" (U+0068) in "hello"
```

### TypeScript

```ts
import { pronounce, type PronounceLang } from 'coptic-pronounce';

const word: string = pronounce('ⲡⲛⲟⲩϯ', 'en');
const lines: string[] = pronounce(['ⲡⲛⲟⲩϯ', 'ⲁⲛⲟⲕ'], 'ar');
```

### Combined with Antonios font conversion

```js
import { toUnicode } from 'coptic-antonios-unicode';
import { pronounce } from 'coptic-pronounce';

const coptic = toUnicode('P,oic');
pronounce(coptic, 'en');
```

## Golden harness

Score output against trusted hymn fixtures (`fixtures/`) that include `coptic` + `copticEnglish` / `arabicCoptic` from Psalmody (Ten Thino, First Hoos).

```bash
npm run harness          # build + English score
npm run harness:ar       # Arabic
npm run harness:verbose  # per-line diffs
```

```bash
node scripts/golden-harness.mjs --lang en --min-score 0.90
```

Metrics: exact match, normalized match (ignore case/hyphens/punct), and average Levenshtein similarity.

Editorial hyphenation and occasional word-splits in the goldens mean exact rates stay low; **avg similarity** is the main quality signal (currently ~0.93 English on the bundled fixtures).

## API

### `pronounce(copticText, lang)`

| Parameter    | Type                   | Description                                 |
|--------------|------------------------|---------------------------------------------|
| `copticText` | `string` \| `string[]` | Coptic Unicode phrase(s)                    |
| `lang`       | string                 | `'en'` / `'english'` or `'ar'` / `'arabic'` |

**Returns:** `string` or `string[]` — same shape as input.

## Liturgical special cases

| Coptic    | English       | Arabic  |
|-----------|---------------|---------|
| `Ⲡ̀ϭⲟⲓⲥ` | Epshois       | بشويس   |
| `Ⲫ̀ⲛⲟⲩϯ` | Efnouti       | افنوتي  |
| `ⲭ̅ⲥ̅`    | Ekrestos      | اخرستوس |
| `ⲇⲟⲝⲁ`    | Zoxa          | ذوكسا   |
| `ⲯⲩⲭⲏ`    | epsishi       | بسيشي   |

## License

MIT
