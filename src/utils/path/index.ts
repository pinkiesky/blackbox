export const getPathColor = (altitude: number): string => {
  if (isNaN(altitude) || altitude < 50) return '#2DCCBC'

  if (altitude < 100) return '#48C3D4'

  return '#4C7DC7'
}
