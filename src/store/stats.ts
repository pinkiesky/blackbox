import { create } from 'zustand'
import type { LogStatistics } from '@/types/data'

interface GlobalLogStatsState {
  stats: LogStatistics | null
  setStats: (newStats: LogStatistics | null) => void
}

export const useGlobalLogStatsStore = create<GlobalLogStatsState>((set) => ({
  stats: null,
  setStats: (newGlobalStats: LogStatistics | null) =>
    set({ stats: newGlobalStats }),
}))
