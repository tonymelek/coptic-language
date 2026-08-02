import sundayKatamarosRefs from './data/sunday_katamaros_refs.json'
import dayReadings from './data/day_readings.json'
import uniqueDailyReadings from './data/unique_daily_readings.json'
import greatLentKatamaros from './data/great_lent_katamaros.json'
import holyFiftyKatamaros from './data/holy_fifty_katamaros.json'
import unmovableFeasts from './unmovableFeasts.json'
import type { DayReadings, FeastDefinition, KatamarosBook, WeekdayName } from './types.js'

export const ONE_DAY_MS = 24 * 60 * 60 * 1000
export const INTL_LOCALE = 'en-CA'
export const DEFAULT_LITURGICAL_DAY_STARTS_AT_HOUR = 18

export const COPTIC_MONTHS = [
  '',
  'Tout',
  'Baba',
  'Hator',
  'Kiahk',
  'Toba',
  'Amshir',
  'Baramhat',
  'Baramouda',
  'Bashans',
  'Paona',
  'Epep',
  'Mesra',
  'Nasie',
] as const

export const WEEKDAYS: WeekdayName[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

/** Season katamaros books keyed by feast.katamaros. */
export const KATAMAROS_BY_SEASON: Partial<
  Record<KatamarosBook, Record<string, DayReadings>>
> = {
  great_lent: greatLentKatamaros as Record<string, DayReadings>,
  holy_fifties: holyFiftyKatamaros as Record<string, DayReadings>,
}

/** Fixed-date feasts (movable Paschal feasts are merged per year in CopticReadings). */
export const BASE_FEASTS_MAP = unmovableFeasts as Record<string, FeastDefinition>

export const SUNDAY_KATAMAROS_REFS = sundayKatamarosRefs as Record<string, DayReadings>
export const DAY_READINGS = dayReadings as Record<string, string[]>
export const UNIQUE_DAILY_READINGS = uniqueDailyReadings as Record<string, DayReadings>
