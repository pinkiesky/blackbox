import { create } from 'zustand'
import type { LogRecord } from '@/parse/types'
import { getDefaultChartSettings } from '@/utils/chart'

export type ChartSettings = Partial<Record<keyof LogRecord, boolean>>

export interface ChartSettingsStore {
  settings: ChartSettings
  setSettings: (newSettings: ChartSettings) => void
}

export const useChartSettingsStore = create<ChartSettingsStore>((set) => ({
  settings: getDefaultChartSettings(),
  setSettings: (newSettings: ChartSettings) => set({ settings: newSettings }),
}))
