import { INTL_LOCALE, ONE_DAY_MS } from './constants.js'
import type { EasterSeasonDates } from './types.js'

export const twoDigit = (num: number): string => (num > 9 ? String(num) : `0${num}`)

const partsToMap = (parts: Intl.DateTimeFormatPart[]): Record<string, string> =>
  Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )

export const formatCalendarParts = (
  date: Date,
  calendar: string,
): Record<string, string> =>
  partsToMap(
    new Intl.DateTimeFormat(INTL_LOCALE, {
      calendar,
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).formatToParts(date),
  )

export const monthDayCode = (month: number | string, day: number | string): string =>
  `${Number(month)}${twoDigit(Number(day))}`

/** When `now` hour ≥ spill hour, liturgical day is the next calendar day. */
export const toEffectiveLiturgicalDay = (
  date: Date,
  now: Date,
  liturgicalDayStartsAtHour: number,
): Date => {
  const spill = now.getHours() >= liturgicalDayStartsAtHour ? 1 : 0
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + spill)
}

/** Orthodox (Julian → Gregorian) Easter and related season anchors for a year. */
export function calculateOrthodoxEaster(year: number): EasterSeasonDates {
  const yearsSinceJulianLeapYear = year % 4
  const marchEquinoxWeekday = year % 7
  const metonicCyclePosition = year % 19
  const moonAge = (19 * metonicCyclePosition + 15) % 30
  const daysToSunday =
    (2 * yearsSinceJulianLeapYear + 4 * marchEquinoxWeekday - moonAge + 34) % 7
  const easterMonth = Math.floor((moonAge + daysToSunday + 114) / 31)
  const easterDay = ((moonAge + daysToSunday + 114) % 31) + 1
  const easterDate = new Date(year, easterMonth - 1, easterDay + 13)
  const easterDateInMs = easterDate.getTime()

  return {
    easterDate,
    hosannaDate: new Date(easterDateInMs - 7 * ONE_DAY_MS),
    pentecosteDate: new Date(easterDateInMs + 49 * ONE_DAY_MS),
    apostolesFastStartDate: new Date(easterDateInMs + 50 * ONE_DAY_MS),
    startOfGreatLent: new Date(easterDateInMs - 55 * ONE_DAY_MS),
    endOfGreatLent: new Date(easterDateInMs - 8 * ONE_DAY_MS),
    startfJonahFast: new Date(easterDateInMs - 69 * ONE_DAY_MS),
    endfJonahFast: new Date(easterDateInMs - 67 * ONE_DAY_MS),
    jonahFeast: new Date(easterDateInMs - 66 * ONE_DAY_MS),
  }
}
