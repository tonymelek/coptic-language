import { KATAMAROS_BY_SEASON } from './constants.js'
import { CopticReadings } from './copticReadings.js'
import type { CopticReadingsOptions, KatamarosBook } from './types.js'

/**
 * Which katamaros path `readingReference` uses — mirrors `CopticReadings` routing
 * (season book → Sunday book → annual `day_readings`).
 */
export type ReadingSource = KatamarosBook | 'sunday'

export interface ReadingRouteInput {
  feast: { katamaros: KatamarosBook }
  isSunday: boolean
}

export function readingSourceFor(day: ReadingRouteInput): ReadingSource {
  const { katamaros } = day.feast
  if (KATAMAROS_BY_SEASON[katamaros]) return katamaros
  if (day.isSunday) return 'sunday'
  return 'annual'
}

/** True when refs come from `day_readings` → `unique_daily_readings`. */
export function usesDayReadings(day: ReadingRouteInput): boolean {
  return readingSourceFor(day) === 'annual' && !day.isSunday
}

/**
 * Find a Gregorian date for a Coptic month/day where `predicate` holds
 * (e.g. annual weekday slots for Katameros remaps).
 */
export function findGregorianForCopticSlot(
  copticMonth: string,
  copticDay: number,
  predicate: (day: CopticReadings) => boolean,
  options: { yearStart?: number; yearEnd?: number; readingOptions?: CopticReadingsOptions } = {},
): Date | null {
  const yearStart = options.yearStart ?? 2018
  const yearEnd = options.yearEnd ?? 2032

  for (let year = yearStart; year <= yearEnd; year++) {
    for (let m = 0; m < 12; m++) {
      for (let d = 1; d <= 31; d++) {
        const date = new Date(year, m, d)
        const liturgical = new CopticReadings(date, {
          now: new Date(year, m, d, 10),
          ...options.readingOptions,
        })
        if (liturgical.copticMonth !== copticMonth || liturgical.copticDay !== copticDay) continue
        if (predicate(liturgical)) return date
      }
    }
  }
  return null
}

/** Gregorian sample where this Coptic slot uses annual `day_readings`. */
export function findAnnualWeekdayForSlot(
  copticMonth: string,
  copticDay: number,
  options?: { yearStart?: number; yearEnd?: number },
): Date | null {
  return findGregorianForCopticSlot(copticMonth, copticDay, usesDayReadings, options)
}
