import type { ChartSettings } from '@/store/chart-settings.ts'

export interface DraggableSelectEvent {
  range: [number, number]
}

export interface GetDraggableSelectRangeOptions {
  onSelect: (event: DraggableSelectEvent) => void
}

export const getDraggableSelectRangeConfig = (
  options: GetDraggableSelectRangeOptions,
) => ({
  enable: true,
  unselectColor: 'rgba(255,255,255,0.65)',
  borderColor: '#2388FF',
  borderWidth: 2,
  text: {
    enable: true,
    color: '#fff',
    font: {
      family: 'Roboto, sans-serif',
      size: 20,
    },
  },
  onSelect: options.onSelect,
})

export const getDefaultChartSettings = (): ChartSettings => ({
  altitudeM: true,
  groundSpeedKmh: false,
})
