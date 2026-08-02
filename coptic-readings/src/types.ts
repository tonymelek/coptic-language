/** Service tune used for hymns / melodies. */
export type Tune = 'joy' | 'hosanna' | 'kiahk' | 'annual' | 'fasting'

/** Which katamaros book supplies the day's readings. */
export type KatamarosBook = 'annual' | 'great_lent' | 'holy_fifties'

export type FeastCalendar = 'coptic' | 'greg'

export type AdamOrWatos = 'adam' | 'watos'

export type WeekdayName =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'

export interface FeastDefinition {
  startDay: number
  endDay: number
  calendar: FeastCalendar
  startMonth: number
  endMonth: number
  tune: Tune
  katamaros?: KatamarosBook
}

export interface ActiveFeast {
  name: string | null
  tune: Tune
  katamaros: KatamarosBook
}

export interface PsalmGospel {
  psalm?: string
  gospel?: string
}

export interface LiturgyReadings {
  prophecies?: string[]
  pauline?: string
  catholic?: string
  acts?: string
  psalm?: string
  gospel?: string
}

/** One liturgical day's katamaros references. */
export interface DayReadings {
  title?: string
  vespers?: PsalmGospel
  matins?: PsalmGospel
  liturgy?: LiturgyReadings
  /** Lent Sunday evening prayer (distinct from Saturday vespers). */
  evening?: PsalmGospel
}

export interface ReadingReference {
  isSunday: boolean
  ref: DayReadings | null | undefined
}

export interface EasterSeasonDates {
  easterDate: Date
  hosannaDate: Date
  pentecosteDate: Date
  apostolesFastStartDate: Date
  startOfGreatLent: Date
  endOfGreatLent: Date
  startfJonahFast: Date
  endfJonahFast: Date
  jonahFeast: Date
}

export interface CopticReadingsOptions {
  /**
   * Instant used for the liturgical-day hour spill (≥ 18:00 → next calendar day).
   * Defaults to `new Date()` (system clock), matching presenter behavior.
   */
  now?: Date
  /** Hour (0–23) at which the next liturgical day begins. Default: 18. */
  liturgicalDayStartsAtHour?: number
}
