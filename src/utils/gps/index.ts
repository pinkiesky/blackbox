export function parseGpsLocation(
  gps: string,
): { lat: number; lng: number } | null {
  if (!gps) return null

  const [lat, lng] = gps.split(' ').map(parseFloat)
  if (isNaN(lat) || isNaN(lng)) return null

  return { lat, lng }
}
