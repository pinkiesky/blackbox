import type { LocationData, Log, LogRecord, Segment } from '@/types/data'
import { compareObjectsRecursively, getColorBetweenTwoColors } from '@/utils'
import type { LatLngExpression } from 'leaflet'
import { config } from 'process'
import { useMemo, useState } from 'react'

interface UseMapPositionsReturn {
  /* States */
  path: LocationData[]
  centerPosition: LocationData | null
  startPosition: LocationData | null
  finishPosition: LocationData | null
  segments: Segment[]

  /* Methods */
  initCenterPosition: () => void
  initPath: () => void
  initStartPosition: () => void
  initFinishPosition: () => void
}

export type LineConfigHandler = (
  record: LogRecord,
  prevRecord: LogRecord | null,
  perc: number,
  index: number,
  log: Log,
  segments: Segment[],
  currentSegment: Segment | null,
) => { opacity: number; color: string }

export function useMapPositions(log: Log, lch: LineConfigHandler): UseMapPositionsReturn {
  const [centerPosition, setCenterPosition] = useState<LocationData | null>(
    null,
  )
  const [startPosition, setStartPosition] = useState<LocationData | null>(null)
  const [finishPosition, setFinishPosition] = useState<LocationData | null>(
    null,
  )
  const [path, setPath] = useState<LocationData[]>([])

  const segments: Segment[] = useMemo(() => {
    const segments: Segment[] = []

    let currentSegment: Segment | null = null
    for (let i = 0; i < log.data.length; i++) {
      const record = log.data[i]
      const perc = record.flightTimeSec / log.durationSec;

      const recordConfig = lch(record, log.data[i - 1] ?? null, perc, i, log, segments, currentSegment)

      if (!currentSegment) {
        currentSegment = {
          points: [record.coordinates],
          config: recordConfig,
        }

        continue;
      }

      currentSegment.points.push(record.coordinates)
      if (!compareObjectsRecursively(currentSegment.config, recordConfig)) {
        segments.push(currentSegment)
        i--;
        currentSegment = null
      }
    }

    if (currentSegment) {
      segments.push(currentSegment)
    }

    return segments
  }, [path]);

  const initCenterPosition = () => {
    if (log.data.length === 0) return

    const arrayCenterIndex = Math.floor(log.data.length / 2)
    const gps = log.data[arrayCenterIndex].coordinates

    setCenterPosition(gps)
  }

  const initPath = () => {
    if (log.data.length === 0) return

    const newPath: LocationData[] = log.data
      .map(({ coordinates }): LocationData => {
        return { ...coordinates }
      })

    setPath(newPath)
  }

  const initStartPosition = () => {
    setStartPosition(log.data[0].coordinates)
  }

  const initFinishPosition = () => {
    const gps = log.data[log.data.length - 1].coordinates
    setFinishPosition({ lat: gps.lat, lng: gps.lng })
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
