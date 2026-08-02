import {
  BASE_FEASTS_MAP,
  COPTIC_MONTHS,
  DAY_READINGS,
  DEFAULT_LITURGICAL_DAY_STARTS_AT_HOUR,
  KATAMAROS_BY_SEASON,
  ONE_DAY_MS,
  SUNDAY_KATAMAROS_REFS,
  UNIQUE_DAILY_READINGS,
  WEEKDAYS,
} from './constants.js'
import {
  calculateOrthodoxEaster,
  formatCalendarParts,
  monthDayCode,
  toEffectiveLiturgicalDay,
  twoDigit,
} from './helpers.js'
import type {
  ActiveFeast,
  AdamOrWatos,
  CopticReadingsOptions,
  FeastDefinition,
  KatamarosBook,
  ReadingReference,
  WeekdayName,
} from './types.js'

export { calculateOrthodoxEaster } from './helpers.js'

export class CopticReadings {
  #date: Date
  #easterDate: Date
  #feastsMap: Record<string, FeastDefinition>

  constructor(date: Date = new Date(), options: CopticReadingsOptions = {}) {
    const now = options.now ?? new Date()
    const liturgicalDayStartsAtHour =
      options.liturgicalDayStartsAtHour ?? DEFAULT_LITURGICAL_DAY_STARTS_AT_HOUR
    this.#date = toEffectiveLiturgicalDay(date, now, liturgicalDayStartsAtHour)

    const year = this.#date.getFullYear()
    const {
      hosannaDate,
      pentecosteDate,
      easterDate,
      apostolesFastStartDate,
      startOfGreatLent,
      endOfGreatLent,
      startfJonahFast,
      endfJonahFast,
      jonahFeast,
    } = calculateOrthodoxEaster(year)
    this.#easterDate = easterDate

    this.#feastsMap = {
      ...BASE_FEASTS_MAP,
      pentecost: {
        startDay: pentecosteDate.getDate(),
        endDay: pentecosteDate.getDate(),
        calendar: 'greg',
        startMonth: pentecosteDate.getMonth() + 1,
        endMonth: pentecosteDate.getMonth() + 1,
        tune: 'joy',
        katamaros: 'holy_fifties',
      },
      hosanna: {
        startDay: hosannaDate.getDate(),
        endDay: hosannaDate.getDate(),
        calendar: 'greg',
        startMonth: hosannaDate.getMonth() + 1,
        endMonth: hosannaDate.getMonth() + 1,
        tune: 'hosanna',
        katamaros: 'great_lent',
      },
      resurrection: {
        startDay: easterDate.getDate(),
        endDay: pentecosteDate.getDate(),
        calendar: 'greg',
        startMonth: easterDate.getMonth() + 1,
        endMonth: pentecosteDate.getMonth() + 1,
        tune: 'joy',
        katamaros: 'holy_fifties',
      },
      apostles_fast: {
        startDay: apostolesFastStartDate.getDate(),
        endDay: 12,
        calendar: 'greg',
        startMonth: apostolesFastStartDate.getMonth() + 1,
        endMonth: 7,
        tune: 'annual',
        katamaros: 'annual',
      },
      jonah_fast: {
        startDay: startfJonahFast.getDate(),
        endDay: endfJonahFast.getDate(),
        calendar: 'greg',
        startMonth: startfJonahFast.getMonth() + 1,
        endMonth: endfJonahFast.getMonth() + 1,
        tune: 'fasting',
        katamaros: 'great_lent',
      },
      jonah_feast: {
        startDay: jonahFeast.getDate(),
        endDay: jonahFeast.getDate(),
        calendar: 'greg',
        startMonth: jonahFeast.getMonth() + 1,
        endMonth: jonahFeast.getMonth() + 1,
        tune: 'annual',
        katamaros: 'great_lent',
      },
      great_lent: {
        startDay: startOfGreatLent.getDate(),
        endDay: endOfGreatLent.getDate(),
        calendar: 'greg',
        startMonth: startOfGreatLent.getMonth() + 1,
        endMonth: endOfGreatLent.getMonth() + 1,
        tune: 'fasting',
        katamaros: 'great_lent',
      },
    }
  }

  /** Calendar day used for feast / weekday / readings (next day when hour ≥ spill). */
  get effectiveLiturgicalDay(): Date {
    return this.#date
  }

  get copticParts(): Record<string, string> {
    return formatCalendarParts(this.#date, 'coptic')
  }

  get copticDate(): string {
    const { day, month, year } = this.copticParts
    return `${twoDigit(Number(day))}/${twoDigit(Number(month))}/${year}`
  }

  get copticMonthNum(): number {
    return Number(this.copticParts.month)
  }

  get copticMonth(): string {
    return COPTIC_MONTHS[this.copticMonthNum] ?? ''
  }

  get copticDay(): number {
    return Number(this.copticParts.day)
  }

  get all(): Record<string, FeastDefinition> {
    return this.#feastsMap
  }

  get isSunday(): boolean {
    return this.#date.getDay() === 0
  }

  /** Calendar days from Resurrection Sunday (Resurrection = 0). */
  get daysFromEaster(): number {
    const a = this.#date
    const b = this.#easterDate
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
    return Math.round((utcA - utcB) / ONE_DAY_MS)
  }

  get readingReference(): ReadingReference {
    const isSunday = this.isSunday
    const { katamaros } = this.feast
    const seasonBook = KATAMAROS_BY_SEASON[katamaros]
    if (seasonBook) {
      // great_lent keys: Easter = 0; holy_fifties keys: Easter = 1
      const offset =
        katamaros === 'holy_fifties' ? this.daysFromEaster + 1 : this.daysFromEaster
      return {
        isSunday,
        ref: seasonBook[String(offset)] ?? null,
      }
    }
    if (isSunday) {
      const sundayOrder = Math.ceil(this.copticDay / 7)
      const key = `${this.copticMonth}-${sundayOrder}`
      return {
        isSunday,
        ref: SUNDAY_KATAMAROS_REFS[key],
      }
    }
    const uniqueKey = DAY_READINGS[this.copticMonth]?.[this.copticDay]
    return {
      isSunday,
      ref: uniqueKey ? (UNIQUE_DAILY_READINGS[uniqueKey] ?? null) : null,
    }
  }

  get weekday(): WeekdayName {
    return WEEKDAYS[this.#date.getDay()]!
  }

  get adamOrWatos(): AdamOrWatos {
    const day = this.#date.getDay()
    return day >= 0 && day <= 2 ? 'adam' : 'watos'
  }

  get feast(): ActiveFeast {
    const gregParts = formatCalendarParts(this.#date, 'gregory')
    const copticDate = monthDayCode(this.copticMonthNum, this.copticDay)
    const gregDate = monthDayCode(gregParts.month, gregParts.day)

    let best: {
      name: string
      tune: ActiveFeast['tune']
      katamaros: KatamarosBook
      span: number
    } | null = null

    for (const key of Object.keys(this.#feastsMap)) {
      const curr = this.#feastsMap[key]!
      const startDate = Number.parseInt(monthDayCode(curr.startMonth, curr.startDay), 10)
      const endDate = Number.parseInt(monthDayCode(curr.endMonth, curr.endDay), 10)
      const comparisonDate = Number.parseInt(
        curr.calendar === 'coptic' ? copticDate : gregDate,
        10,
      )
      if (comparisonDate < startDate || comparisonDate > endDate) continue

      const span = endDate - startDate
      if (!best || span < best.span) {
        best = {
          name: key,
          tune: curr.tune,
          katamaros: curr.katamaros ?? 'annual',
          span,
        }
      }
    }

    return best
      ? { name: best.name, tune: best.tune, katamaros: best.katamaros }
      : { name: null, tune: 'annual', katamaros: 'annual' }
  }
}
