import { create } from 'zustand'
import { FiltersType } from '@/types/filters.ts'
import type { FlightDate } from '@/hooks/useFlightDates'

export type FiltersData = Record<FiltersType, FlightDate<any>>

interface FiltersState {
  currentFilter: FiltersType
  filters: FiltersData
  setCurrentFilter: (filter: FiltersType) => void
  setFilter: (filter: keyof FiltersData, value: FlightDate<any>) => void
  setFilters: (filters: FiltersData) => void
}

export const getPureFilter = (): FlightDate<any> => ({
  date: '',
  time: '',
  normalizedDate: '',
  item: null,
})

export const getPureFilters = (): FiltersData => ({
  [FiltersType.ALTITUDE]: getPureFilter(),
  [FiltersType.BAT]: getPureFilter(),
  [FiltersType.SPEED]: getPureFilter(),
})

export const useFiltersStore = create<FiltersState>((set) => ({
  currentFilter: FiltersType.ALTITUDE,
  filters: getPureFilters(),
  setCurrentFilter: (newFilter: FiltersType) =>
    set({ currentFilter: newFilter }),
  setFilters: (newFilters: FiltersData) => set({ filters: newFilters }),
  setFilter: (filter: keyof FiltersData, value: FlightDate<any>) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [filter]: value,
      },
    })),
}))
