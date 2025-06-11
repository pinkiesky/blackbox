import { useMemo } from 'react'
import type { DataRecord } from '@/types/data'
import { parseDate } from '@/utils/date'
import { useDataStore } from '@/store/data.ts'

export type UseFlightDatesOptions<K extends keyof DataRecord> = {
  item: K
}

export type FlightDate<K extends keyof DataRecord> = {
  date: string
  time: string
  normalizedDate: string
  item: DataRecord[K]
}

export function useFlightDates<K extends keyof DataRecord>(
  options: UseFlightDatesOptions<K>,
) {
  const { data } = useDataStore()

  const formattedDates = useMemo<FlightDate<K>[]>(() => {
    let lastItem: DataRecord[K] | undefined

    return data.reduce<FlightDate<K>[]>((acc, record) => {
      const timeSec = record.Time.split('.')[0]
      const normalized = parseDate(record.Date, timeSec, {
        dateFormat: 'dd.MM.yy',
      })
      const currentItem = record[options.item]

      if (currentItem !== lastItem) {
        lastItem = currentItem

        acc.push({
          date: record.Date,
          time: timeSec,
          normalizedDate: normalized,
          item: record[options.item],
        })
      }
      return acc
    }, [])
  }, [data, options.item])

  return { formattedDates }
}
