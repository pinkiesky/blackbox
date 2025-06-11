export const getPathColor = (altitude: number): string => {
  if (altitude < 50) return 'green'

  if (altitude < 100) return 'yellow'

  return 'red'
}
