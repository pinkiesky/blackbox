import { create } from 'zustand'
import type { DataRecord } from '@/types/data'

interface DataState {
  data: DataRecord[]
  setData: (newData: DataRecord[]) => void
}

export const useDataStore = create<DataState>((set) => ({
  data: [],
  setData: (newData: DataRecord[]) => set({ data: newData }),
}))
