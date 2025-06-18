import { create } from 'zustand'
import type { Log } from '@/types/data'

interface DataState {
  data: Log | null
  setData: (newData: Log | null) => void
}

export const useDataStore = create<DataState>((set) => ({
  data: null,
  setData: (newData: Log | null) => set({ data: newData }),
}))
