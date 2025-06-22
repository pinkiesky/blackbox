import type { Log } from '@/parse/types'
import { create } from 'zustand'

interface LogState {
  log: Log | null
  setLog: (newData: Log | null) => void
}

export const useLogStore = create<LogState>((set) => ({
  log: null,
  setLog: (newLog: Log | null) => set({ log: newLog }),
}))
