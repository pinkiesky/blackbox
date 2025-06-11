import { useMemo } from 'react'
import type { DataRecord } from '@/types/data'
import { parseDate } from '@/utils/date'
import { useDataStore } from '@/store/data.ts'

export type UseFlightItemsOptions<K extends keyof DataRecord> = {
  value: K
}

export type FlightItem<K extends keyof DataRecord> = {
  date: string
  time: string
  normalizedDate: string
  value: DataRecord[K]
  key: keyof DataRecord
  isMin: boolean
  isMax: boolean
}

export function useFlightFilter<K extends keyof DataRecord>(
  options: UseFlightItemsOptions<K>,
) {
  const { data } = useDataStore()

  const formattedItems = useMemo<FlightItem<K>[]>(() => {
    let lastItem: DataRecord[K] | undefined

    const items = data.reduce<FlightItem<K>[]>((acc, record) => {
      const timeSec = record.Time.split('.')[0]
      const normalized = parseDate(record.Date, timeSec, {
        dateFormat: 'dd.MM.yy',
      })
      const currentValue = record[options.value]

      if (currentValue !== lastItem) {
        lastItem = currentValue

        acc.push({
          date: record.Date,
          time: timeSec,
          normalizedDate: normalized,
          value: currentValue,
          key: options?.value,
          isMin: false,
          isMax: false,
        })
      }
      return acc
    }, [])

    if (items.length === 0) return []

    const values = items.map((item) => Number(item.value))
    const minVal = Math.min(...values)
    const maxVal = Math.max(...values)

    return items.map((item) => ({
      ...item,
      isMin: Number(item.value) === minVal,
      isMax: Number(item.value) === maxVal,
    }))
  }, [data, options.value])

  return {
    formattedItems,
  }
}
