export interface DraggableSelectEvent {
  range: [string, string]
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
    color: '#000',
    offset: -15,
    padding: 1,
    font: {
      family: 'Arial',
      size: 13,
    },
  },
  onSelect: options.onSelect,
})
