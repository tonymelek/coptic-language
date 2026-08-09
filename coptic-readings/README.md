# coptic-readings

Given a date, get the **Coptic Orthodox liturgical reading references** for that day — Psalms, Gospels, Pauline, Catholic, Acts, and (in Lent) prophecies — plus feast, tune, and Coptic calendar context.

This package returns **Bible references** (e.g. `John 20:1-18`). Turning those into verse text is left to your Bible source of choice.

## Install

```bash
npm install coptic-readings
```

Works with **ESM**, **CommonJS**, and **TypeScript**.

## What reading books are used?

The Coptic Church uses different **Katamaros** books depending on the season. This package picks the right one for each day:

| Season | Source | When it’s used |
| --- | --- | --- |
| **Annual Katamaros** (weekdays) | Daily readings for each Coptic month/day | Ordinary weekdays outside special seasons |
| **Sunday Katamaros** | Readings for the 1st–5th Sunday of each Coptic month | Sundays in the annual cycle |
| **Great Lent Katamaros** | Lent weekday & Holy Week readings | Jonah Fast, Great Lent, and Palm Sunday (Hosanna) |
| **Holy Fifty Katamaros** | Readings from Resurrection through Pentecost | The 50 days from Easter to Pentecost |

You don’t need to choose the book yourself — pass a date and the library selects the matching season.

## Quick start

```js
import { CopticReadings } from 'coptic-readings'

const day = new CopticReadings(new Date(2026, 3, 12)) // 12 Apr 2026

console.log(day.feast)
// { name: 'resurrection', tune: 'joy', katamaros: 'holy_fifties' }

console.log(day.readingReference.ref?.liturgy)
// {
//   pauline: '1 Corinthians 15:23-50',
//   catholic: '1 Peter 3:15-4:6',
//   acts: 'Acts 2:22-28',
//   psalm: 'Psalms 118:24,25,27',           // MT — Bible text lookup
//   psalm_coptic_ref: 'Psalms 117:24,25,27', // LXX/Coptic — display
//   gospel: 'John 20:1-18'
// }
```

Psalm fields ship as a pair wherever a psalm is present:

| Field | Numbering | Use |
| --- | --- | --- |
| `psalm` | Masoretic (NKJV) | Resolve verse text (`bible-citation-text`, etc.) |
| `psalm_coptic_ref` | Septuagint / Coptic | Show the liturgical citation to users |

Helpers `mtPsalmToCopticRef`, `mtToLxxChapter`, and `lxxToMtChapter` are exported if you need the same mapping elsewhere.
### CommonJS

```js
const { CopticReadings } = require('coptic-readings')
```

### TypeScript

```ts
import { CopticReadings, type DayReadings, type ActiveFeast } from 'coptic-readings'

const day = new CopticReadings(new Date(2026, 3, 12))
const feast: ActiveFeast = day.feast
const ref: DayReadings | null | undefined = day.readingReference.ref
```

---

## Describe a liturgical day

A small helper that gathers the useful fields in one place:

```js
import { CopticReadings } from 'coptic-readings'

function formatYmd(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function describeLiturgicalDay(date, options = {}) {
  const day = new CopticReadings(date, {
    // Pin clock so evening (≥ 18:00) does not shift the day in daytime examples
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

### Resurrection Sunday — 2026-04-12

Uses the **Holy Fifty** Katamaros:

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

### Great Lent weekday — 2026-02-23

Uses the **Great Lent** Katamaros (includes Old Testament prophecies at liturgy):

```js
describeLiturgicalDay(new Date(2026, 1, 23))
```

```json
{
  "date": "2026-02-23",
  "feast": { "name": "great_lent", "tune": "fasting", "katamaros": "great_lent" },
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

### Jonah Fast — 2026-02-02

Also draws from the **Great Lent** Katamaros:

```js
describeLiturgicalDay(new Date(2026, 1, 2))
// feast.name === "jonah_fast"
// ref.title === "Monday of Jonah's Fast"
// liturgy.prophecies === ["Jonah 1:1-2:1"]
```

### Pentecost — 2026-05-31

Last day of the **Holy Fifty**:

```js
describeLiturgicalDay(new Date(2026, 4, 31))
// feast.name === "pentecost"
// ref.title === "Seventh Sunday of the Holy Fifty (Feast of Pentecost)"
```

### Ordinary annual day — 2026-07-18

**Annual Katamaros** weekday readings:

```js
describeLiturgicalDay(new Date(2026, 6, 18))
// feast: { name: null, tune: "annual", katamaros: "annual" }
// liturgy.gospel === "Luke 12:4-12"
```

### After 6pm — next liturgical day

In Coptic practice, the liturgical day often begins in the evening. By default, after **18:00** the package treats the date as the **next** calendar day:

```js
const evening = new Date(2026, 3, 11, 19) // Sat 11 Apr 2026, 19:00
describeLiturgicalDay(new Date(2026, 3, 11), { now: evening })
// effectiveLiturgicalDay → "2026-04-12" (Resurrection Sunday)
```

You can change the hour with `liturgicalDayStartsAtHour`, or pass `now` to control the clock used for that check.

---

## Orthodox Easter dates for a year

Need the movable-season anchors (Jonah Fast, Great Lent, Palm Sunday, Easter, Pentecost, Apostles’ Fast)?

```js
import { calculateOrthodoxEaster } from 'coptic-readings'

function formatYmd(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function describePaschalYear(year) {
  const s = calculateOrthodoxEaster(year)
  return {
    year,
    jonah_fast: {
      start: formatYmd(s.startfJonahFast),
      end: formatYmd(s.endfJonahFast),
      feast: formatYmd(s.jonahFeast),
    },
    great_lent: {
      start: formatYmd(s.startOfGreatLent),
      end: formatYmd(s.endOfGreatLent),
    },
    hosanna: formatYmd(s.hosannaDate),
    resurrection: formatYmd(s.easterDate),
    pentecost: formatYmd(s.pentecosteDate),
    apostles_fast_start: formatYmd(s.apostolesFastStartDate),
  }
}

console.log(JSON.stringify(describePaschalYear(2026), null, 2))
```

### Example — 2026

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

| Milestone | 2026 date |
| --- | --- |
| Jonah Fast | 2–4 Feb (feast 5 Feb) |
| Great Lent | 16 Feb – 4 Apr |
| Hosanna (Palm Sunday) | 5 Apr |
| **Resurrection** | **12 Apr** |
| Pentecost | 31 May |
| Apostles’ Fast begins | 1 Jun |

---

## API summary

### `new CopticReadings(date?, options?)`

| Option | Default | Description |
| --- | --- | --- |
| `now` | `new Date()` | Clock used for the evening liturgical-day rollover |
| `liturgicalDayStartsAtHour` | `18` | Hour when the next liturgical day begins |

| Getter | Description |
| --- | --- |
| `readingReference` | `{ isSunday, ref }` — vespers / matins / liturgy (/ evening) Bible refs |
| `feast` | `{ name, tune, katamaros }` — active feast (`name` is `null` on ordinary days) |
| `copticDate` / `copticMonth` / `copticDay` | Coptic calendar for the liturgical day |
| `weekday` / `adamOrWatos` / `isSunday` | Weekday helpers |
| `daysFromEaster` | Days relative to Resurrection (`0` = Easter Sunday) |
| `effectiveLiturgicalDay` | Calendar date after applying the evening rollover |
| `all` | Full feast map for the year |

### `calculateOrthodoxEaster(year)`

Returns `{ easterDate, hosannaDate, pentecosteDate, apostolesFastStartDate, startOfGreatLent, endOfGreatLent, startfJonahFast, endfJonahFast, jonahFeast }`.
