import type { Log } from '@/parse/types'
import { create } from 'zustand'

interface LogState {
  log: Log | null
  rawLog: Log | null
  setLog: (newData: Log | null) => void
  setRawLog: (newRawData: Log | null) => void
}

export const useLogStore = create<LogState>((set) => ({
  log: null,
  rawLog: null,
  setLog: (newLog: Log | null) => set({ log: newLog }),
  setRawLog: (newRawLog: Log | null) => set({ rawLog: newRawLog }),
}))
