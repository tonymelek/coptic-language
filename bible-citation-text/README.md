# bible-citation-text

Turn a Bible citation string into verse text (English / Arabic) from public chapter assets.

Works with any standard ref — `John 20:1-18`, `Psalms 145:3,6`, `2 Timothy 1:12-2:10` — including refs from packages like [`coptic-readings`](https://www.npmjs.com/package/coptic-readings).

Default asset host: `https://tonymelek.github.io/bible`

## Install

```bash
npm install bible-citation-text
```

## `getBibleText`

```js
import { getBibleText } from 'bible-citation-text'

const text = await getBibleText('Psalms 122:5-6;Psalms 145:3,6')
// { en: "...", ar: "", versesEn: [...], versesAr: [] }  // langs default: ['en']
```

```js
await getBibleText('Matthew 18:1-9', {
  langs: ['en', 'ar'],
  cache: true, // reuse chapter JSON across calls
})
```

Pass a `string[]` to get a map keyed by each input ref:

```js
const map = await getBibleText(['Psalms 122:5-6', 'Matthew 18:1-9'])
// {
//   'Psalms 122:5-6': { en, ar, versesEn, versesAr },
//   'Matthew 18:1-9': { en, ar, versesEn, versesAr },
// }
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `langs` | `['en']` | Languages to fetch (`'en'`, `'ar'`) |
| `cache` | off | `true` for shared cache, or pass a `Map` to share your own |
| `baseUrl` | GitHub Pages host | Override asset root |

Duplicate chapter/lang pairs inside one call are always fetched once (e.g. `Psalms 145:3,6`).

### Verse forms

| Spec | Meaning |
|------|---------|
| `5` | verse 5 |
| `5-9` | verses 5 through 9 |
| `3,6` | verses 3 and 6 |
| `12-2:10` | from 12 through chapter 2 verse 10 |

```js
await getBibleText('Psalms 127:1;Psalms 127:5')
await getBibleText('2 Timothy 1:12-2:10')
```

## Helpers

```js
import {
  parseCitation,
  resolveBookName,
  clearBibleCache,
  DEFAULT_BIBLE_BASE_URL,
} from 'bible-citation-text'

parseCitation('Psalms 145:3,6')
clearBibleCache() // wipe shared cache from `cache: true`
```
