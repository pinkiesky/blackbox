import { useMemo, useState } from 'react'
import type {
  LocationData,
  Log,
  LogRecord,
  LogStatistics,
  Segment,
} from '@/types/data'
import { compareObjectsRecursively } from '@/utils'

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
  stat: LogStatistics,
) => Segment['config']

export function useMapPositions(
  log: Log,
  stat: LogStatistics,
  lch: LineConfigHandler,
): UseMapPositionsReturn {
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
    for (let i = 0; i < log.records.length; i++) {
      const record = log.records[i]

      const recordConfig = lch(record, stat)

      if (!currentSegment) {
        currentSegment = {
          points: [record.coordinates],
          config: recordConfig,
        }

        continue
      }

      currentSegment.points.push(record.coordinates)
      if (!compareObjectsRecursively(currentSegment.config, recordConfig)) {
        segments.push(currentSegment)
        i--
        currentSegment = null
      }
    }

    if (currentSegment) {
      segments.push(currentSegment)
    }

    return segments
  }, [lch, log])

  const initCenterPosition = () => {
    if (log.records.length === 0) return
    setCenterPosition({
      lat: log.records[0].coordinates.lat,
      lng: log.records[0].coordinates.lng,
    })
  }

  const initPath = () => {
    if (log.records.length === 0) return

    const newPath: LocationData[] = log.records.map(
      ({ coordinates }): LocationData => {
        return { ...coordinates }
      },
    )

    setPath(newPath)
  }

  const initStartPosition = () => {
    setStartPosition(log.records[0].coordinates)
  }

  const initFinishPosition = () => {
    const gps = log.records[log.records.length - 1].coordinates
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
