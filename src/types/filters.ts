import type { RadiomasterLogRecord } from '@/types/data'

export enum FiltersType {
  ALTITUDE,
  SPEED,
  BAT,
}

export type FilterLogItem<K extends keyof RadiomasterLogRecord> = {
  date: string
  time: string
  normalizedDate: string
  value: RadiomasterLogRecord[K]
  key: keyof RadiomasterLogRecord
  isMin: boolean
  isMax: boolean
}
