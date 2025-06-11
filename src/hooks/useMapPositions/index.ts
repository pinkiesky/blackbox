import type { DataRecord, LocationData } from '@/types/data'
import type { LatLngExpression } from 'leaflet'
import { useState } from 'react'
import { parseGpsLocation } from '@/utils/gps'

interface UseMapPositionsReturn {
  /* States */
  path: LocationData[]
  centerPosition: LocationData | null
  startPosition: LocationData | null
  finishPosition: LocationData | null
  segments: LatLngExpression[][]

  /* Methods */
  initCenterPosition: () => void
  initPath: () => void
  initStartPosition: () => void
  initFinishPosition: () => void
}

export function useMapPositions(data: DataRecord[]): UseMapPositionsReturn {
  const [centerPosition, setCenterPosition] = useState<LocationData | null>(
    null,
  )
  const [startPosition, setStartPosition] = useState<LocationData | null>(null)
  const [finishPosition, setFinishPosition] = useState<LocationData | null>(
    null,
  )
  const [path, setPath] = useState<LocationData[]>([])

  const segments = path
    .slice(1)
    .map((point, i) => [path[i], point] as LatLngExpression[])

  const initCenterPosition = () => {
    if (data.length === 0) return

    const arrayCenterIndex = Math.floor(data.length / 2)

    const gps = data[arrayCenterIndex].GPS
    if (!gps) return

    const [lat, lng] = gps.split(' ').map(Number)
    if (isNaN(lat) || isNaN(lng)) return

    setCenterPosition({ lat, lng })
  }

  const initPath = () => {
    if (data.length === 0) return

    const newPath: LocationData[] = data
      .map((record) => {
        const gps = record.GPS
        if (!gps) return null

        const parsedGps = parseGpsLocation(gps)
        if (!parsedGps) return null

        return { lat: parsedGps.lat, lng: parsedGps.lng }
      })
      .filter((location): location is LocationData => location !== null)

    setPath(newPath)
  }

  const initStartPosition = () => {
    const gps = data[0].GPS
    if (!gps) return

    const parsedGps = parseGpsLocation(gps)
    if (!parsedGps) return

    setStartPosition({ lat: parsedGps.lat, lng: parsedGps.lng })
  }

  const initFinishPosition = () => {
    const gps = data[data.length - 1].GPS
    if (!gps) return

    const parsedGps = parseGpsLocation(gps)
    if (!parsedGps) return

    setFinishPosition({ lat: parsedGps.lat, lng: parsedGps.lng })
  }

  return {
    /* States */
    path,
    centerPosition,
    startPosition,
    finishPosition,
    segments,

    /* Methods */
    initCenterPosition,
    initPath,
    initStartPosition,
    initFinishPosition,
  }
}
