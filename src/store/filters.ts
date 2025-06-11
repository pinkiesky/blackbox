import { create } from 'zustand'
import { FiltersType } from '@/types/filters.ts'
import type { FlightItem } from '@/hooks/useFlightFilter'
import type { DataRecord } from '@/types/data.ts'

export type FiltersData = Record<FiltersType, FlightItem<any>>

interface FiltersState {
  currentFilter: FiltersType
  filters: FiltersData
  setCurrentFilter: (filter: FiltersType) => void
  setFilter: (filter: keyof FiltersData, value: FlightItem<any>) => void
  setFilters: (filters: FiltersData) => void
}

export const getPureFilter = (key: keyof DataRecord): FlightItem<any> => ({
  date: '',
  time: '',
  normalizedDate: '',
  value: null,
  key,
  isMin: false,
  isMax: false,
})

export const getPureFilters = (): FiltersData => ({
  [FiltersType.ALTITUDE]: getPureFilter('Alt(m)'),
  [FiltersType.BAT]: getPureFilter('Bat%(%)'),
  [FiltersType.SPEED]: getPureFilter('GSpd(kmh)'),
})

export const useFiltersStore = create<FiltersState>((set) => ({
  currentFilter: FiltersType.ALTITUDE,
  filters: getPureFilters(),
  setCurrentFilter: (newFilter: FiltersType) =>
    set({ currentFilter: newFilter }),
  setFilters: (newFilters: FiltersData) => set({ filters: newFilters }),
  setFilter: (filter: keyof FiltersData, value: FlightItem<any>) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [filter]: value,
      },
    })),
}))
