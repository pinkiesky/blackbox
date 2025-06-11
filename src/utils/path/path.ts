export const getPathColor = (altitude: number): string => {
  if (isNaN(altitude) || altitude < 50) return 'green'

  if (altitude < 100) return 'yellow'

  return 'red'
}
