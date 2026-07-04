# coptic-antonios-unicode

[![npm version](https://img.shields.io/npm/v/coptic-antonios-unicode.svg)](https://www.npmjs.com/package/coptic-antonios-unicode)

Convert text encoded in the **Antonios** Coptic font (Latin keyboard layout) to **Coptic Unicode**.

Dictionary PDFs and legacy Coptic texts often used custom fonts where Latin letters stand in for Coptic characters — for example `amyn` instead of `ⲁⲙⲏⲛ`. This package maps those characters using the Antonios font table.

Unmapped characters (spaces, slashes, hyphens, digits, etc.) are left unchanged.

## Install

```bash
npm install coptic-antonios-unicode
```

[npmjs.com/package/coptic-antonios-unicode](https://www.npmjs.com/package/coptic-antonios-unicode)

## Usage

### CommonJS

```js
const { toUnicode } = require('coptic-antonios-unicode');

const antoniosFontText = 'amyn';
console.log(toUnicode(antoniosFontText));
// ⲁⲙⲏⲛ
```

### ES modules

```js
import { toUnicode } from 'coptic-antonios-unicode';

const antoniosFontText = 'Taisoury';
console.log(toUnicode(antoniosFontText));
// Ⲧⲁⲓϣⲟⲩⲣⲏ
```

### Empty or missing input

```js
toUnicode('');        // ''
toUnicode(null);      // ''
toUnicode(undefined); // ''
```

## API

### `toUnicode(text)`

Converts an Antonios-font Latin string to Coptic Unicode.

| Parameter | Type   | Description               |
|-----------|--------|---------------------------|
| `text`    | string | Latin-encoded Coptic text |

**Returns:** `string` — Coptic Unicode text. Returns `''` for falsy input.

### TypeScript

Types are included — no `@types` package needed.

```ts
import { toUnicode } from 'coptic-antonios-unicode';

const coptic: string = toUnicode('Taisoury');
// Ⲧⲁⲓϣⲟⲩⲣⲏ
```

Works with `moduleResolution: "node16"`, `"nodenext"`, or `"bundler"`.

## License

MIT