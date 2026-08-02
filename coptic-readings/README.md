# coptic-readings

Day-round Coptic liturgical readings: given a date, get the katamaros references for that day (annual, Great Lent, Holy Fifty), plus feast / tune context.

Bible text resolution (turning a ref like `John 20:1-18` into verses) is out of scope — use a separate package for that.

## Install

```bash
npm install coptic-readings
```

Works with **ESM** (`.mjs`), **CommonJS** (`.cjs`), and **TypeScript** (bundled `.d.ts`).

---

## `CopticReadings` — describe a liturgical day

Build a small helper around the library (same shape as a season dump / debug script):

```js
import { CopticReadings } from 'coptic-readings'

function formatYmd(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Snapshot of feast + katamaros refs for a calendar date. */
function describeLiturgicalDay(date, options = {}) {
  const day = new CopticReadings(date, {
    // Pin clock so evening spill (≥ 18:00) does not shift the day in examples
    now: options.now ?? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10),
    ...options,
  })
  const { ref, isSunday } = day.readingReference

  return {
    date: formatYmd(date),
    effectiveLiturgicalDay: formatYmd(day.effectiveLiturgicalDay),
    copticDate: day.copticDate,
    copticMonth: day.copticMonth,
    copticDay: day.copticDay,
    weekday: day.weekday,
    adamOrWatos: day.adamOrWatos,
    isSunday: day.isSunday,
    daysFromEaster: day.daysFromEaster,
    feast: day.feast,
    readingReference: {
      isSunday,
      ref: ref
        ? {
            title: ref.title ?? null,
            vespers: ref.vespers ?? null,
            matins: ref.matins ?? null,
            liturgy: ref.liturgy ?? null,
            evening: ref.evening ?? null,
          }
        : null,
    },
  }
}

console.log(JSON.stringify(describeLiturgicalDay(new Date(2026, 3, 12)), null, 2))
```

### Example output — Resurrection Sunday (2026-04-12)

```json
{
  "date": "2026-04-12",
  "effectiveLiturgicalDay": "2026-04-12",
  "copticDate": "04/08/1742",
  "copticMonth": "Baramouda",
  "copticDay": 4,
  "weekday": "Sunday",
  "adamOrWatos": "adam",
  "isSunday": true,
  "daysFromEaster": 0,
  "feast": {
    "name": "resurrection",
    "tune": "joy",
    "katamaros": "holy_fifties"
  },
  "readingReference": {
    "isSunday": true,
    "ref": {
      "title": "Glorious Resurrection Sunday",
      "vespers": null,
      "matins": {
        "psalm": "Psalms 77:56;Psalms 77:60",
        "gospel": "Mark 16:2-11"
      },
      "liturgy": {
        "pauline": "1 Corinthians 15:23-50",
        "catholic": "1 Peter 3:15-4:6",
        "acts": "Acts 2:22-28",
        "psalm": "Psalms 117:12-25",
        "gospel": "John 20:1-18"
      },
      "evening": null
    }
  }
}
```

### More seasons (same helper)

**Great Lent weekday** — `2026-02-23`:

```js
describeLiturgicalDay(new Date(2026, 1, 23))
```

```json
{
  "date": "2026-02-23",
  "feast": { "name": "great_lent", "tune": "fasting", "katamaros": "great_lent" },
  "daysFromEaster": -48,
  "readingReference": {
    "ref": {
      "title": "Monday of the second week of Great Lent",
      "matins": { "psalm": "Psalms 38:11", "gospel": "Mark 9:25-29" },
      "liturgy": {
        "prophecies": ["Exodus 3:6-14", "Isaiah 4:2-5:7"],
        "pauline": "Romans 1:18-25",
        "catholic": "Jude 1:1-8",
        "acts": "Acts 4:36-5:11",
        "psalm": "Psalms 28:1-2",
        "gospel": "Luke 18:1-8"
      }
    }
  }
}
```

**Jonah Fast** — `2026-02-02`:

```js
describeLiturgicalDay(new Date(2026, 1, 2))
// feast.name === "jonah_fast"
// ref.title === "Monday of Jonah's Fast"
// liturgy.prophecies === ["Jonah 1:1-2:1"]
```

**Pentecost** — `2026-05-31`:

```js
describeLiturgicalDay(new Date(2026, 4, 31))
// feast.name === "pentecost"
// daysFromEaster === 49
// ref.title === "Seventh Sunday of the Holy Fifty (Feast of Pentecost)"
```

**Annual day** (no named feast) — `2026-07-18`:

```js
describeLiturgicalDay(new Date(2026, 6, 18))
// feast: { name: null, tune: "annual", katamaros: "annual" }
// liturgy.gospel === "Luke 12:4-12"
```

### Liturgical-day spill (≥ 18:00)

When system/`now` hour is ≥ 18, the effective day advances by one calendar day:

```js
const evening = new Date(2026, 3, 11, 19) // Sat 11 Apr 2026, 19:00
describeLiturgicalDay(new Date(2026, 3, 11), { now: evening })
// effectiveLiturgicalDay → "2026-04-12" (Resurrection)
```

### CommonJS

```js
const { CopticReadings } = require('coptic-readings')
const day = new CopticReadings(new Date(2026, 3, 12))
console.log(day.feast, day.readingReference.ref?.liturgy)
```

### TypeScript

```ts
import { CopticReadings, type DayReadings, type ActiveFeast } from 'coptic-readings'

const day = new CopticReadings(new Date(2026, 3, 12), {
  liturgicalDayStartsAtHour: 18,
})
const feast: ActiveFeast = day.feast
const ref: DayReadings | null | undefined = day.readingReference.ref
```

---

## `calculateOrthodoxEaster(year)` — Paschal season anchors

Returns Orthodox (Julian → Gregorian) Easter and every date this package derives from it: Jonah Fast, Great Lent, Hosanna, Pentecost, Apostles’ Fast start.

```js
import { calculateOrthodoxEaster } from 'coptic-readings'

function formatYmd(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Human-readable Paschal timeline for a year. */
function describePaschalYear(year) {
  const s = calculateOrthodoxEaster(year)
  return {
    year,
    jonah_fast: {
      start: formatYmd(s.startfJonahFast),   // Easter − 69
      end: formatYmd(s.endfJonahFast),       // Easter − 67
      feast: formatYmd(s.jonahFeast),        // Easter − 66
    },
    great_lent: {
      start: formatYmd(s.startOfGreatLent),  // Easter − 55 (Monday week 1)
      end: formatYmd(s.endOfGreatLent),      // Easter − 8
    },
    hosanna: formatYmd(s.hosannaDate),       // Easter − 7 (Palm Sunday)
    resurrection: formatYmd(s.easterDate),   // 0
    pentecost: formatYmd(s.pentecosteDate),  // Easter + 49
    apostles_fast_start: formatYmd(s.apostolesFastStartDate), // Easter + 50
  }
}

console.log(JSON.stringify(describePaschalYear(2026), null, 2))
```

### Example output — 2026

```json
{
  "year": 2026,
  "jonah_fast": {
    "start": "2026-02-02",
    "end": "2026-02-04",
    "feast": "2026-02-05"
  },
  "great_lent": {
    "start": "2026-02-16",
    "end": "2026-04-04"
  },
  "hosanna": "2026-04-05",
  "resurrection": "2026-04-12",
  "pentecost": "2026-05-31",
  "apostles_fast_start": "2026-06-01"
}
```

Offsets from Resurrection (`daysFromEaster`, where Easter Sunday = `0`):

| Milestone | Offset | 2026 date |
| --- | ---: | --- |
| Jonah Fast start | −69 | 2026-02-02 |
| Jonah Feast | −66 | 2026-02-05 |
| Great Lent start | −55 | 2026-02-16 |
| Great Lent end | −8 | 2026-04-04 |
| Hosanna (Palm Sunday) | −7 | 2026-04-05 |
| **Resurrection** | **0** | **2026-04-12** |
| Pentecost | +49 | 2026-05-31 |
| Apostles’ Fast start | +50 | 2026-06-01 |

`great_lent` katamaros keys use these offsets as-is (`"-55"`, `"-7"`, …).  
`holy_fifties` keys use **Easter = 1** (`"1"` … `"50"`), i.e. `daysFromEaster + 1`.

---

## API summary

### `new CopticReadings(date?, options?)`

| Option | Default | Description |
| --- | --- | --- |
| `now` | `new Date()` | Clock for the ≥18:00 liturgical-day spill |
| `liturgicalDayStartsAtHour` | `18` | Hour when the next liturgical day begins |

| Getter | Description |
| --- | --- |
| `readingReference` | `{ isSunday, ref }` — vespers / matins / liturgy (/ evening) refs |
| `feast` | `{ name, tune, katamaros }` — active feast (`name` is snake_case or `null`) |
| `copticDate` / `copticMonth` / `copticDay` | Coptic calendar for the liturgical day |
| `weekday` / `adamOrWatos` / `isSunday` | Weekday helpers |
| `daysFromEaster` | Offset from Resurrection (`0` = Easter Sunday) |
| `effectiveLiturgicalDay` | Date after applying the evening spill |
| `all` | Full feast map for the year |

### `calculateOrthodoxEaster(year)`

Returns `{ easterDate, hosannaDate, pentecosteDate, apostolesFastStartDate, startOfGreatLent, endOfGreatLent, startfJonahFast, endfJonahFast, jonahFeast }`.
