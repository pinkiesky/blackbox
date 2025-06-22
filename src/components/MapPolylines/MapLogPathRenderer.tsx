import { useMemo, type FC } from 'react'
import { type PathOptions } from 'leaflet'
import { Polyline, Popup, Marker } from 'react-leaflet'
import type { Arrow, LocationData, Segment } from '@/types/data'
import { createRotatedArrowIcon } from '../icons/ArrowIcon'
import { getDistanceBetweenPoints } from '@/utils'
import { useLogStore } from '@/store/log.ts'
import type { Log, LogRecord } from '@/parse/types'

// Types
export interface GetSegmentConfigOptions {
  log: Log
  usedRecords: LogRecord[]
  fromSec: number
  toSec: number
}

type GetSegmentConfig = (options: GetSegmentConfigOptions) => Segment['config']

interface PathArrowSegment {
  arrows: Arrow[]
  points: LocationData[]
  config: Segment['config']
}

interface Props {
  getConfig: GetSegmentConfig
}

// Constants
const DEFAULT_PATH_OPTIONS: PathOptions = {
  color: '#00f',
  weight: 4,
  opacity: 1,
  stroke: true,
}

const MAX_SEGMENT_DISTANCE_M = 100
const MAX_ARROW_DISTANCE_M = 75

const MapLogPathRenderer: FC<Props> = ({ getConfig }) => {
  const { log } = useLogStore()

  const segments = useMemo(() => {
    if (!log?.records?.length) return []

    const res: PathArrowSegment[] = []
    let points: LocationData[] = []
    let arrows: Arrow[] = []
    let segmentDistance = 0
    let arrowDistance = 0
    let lastArrowPos: LocationData | null = null

    const flush = (used: LogRecord[]) => {
      if (!points.length) return
      res.push({
        points,
        arrows,
        config: getConfig({
          log,
          usedRecords: used,
          fromSec: used[0].flightTimeSec,
          toSec: used[used.length - 1].flightTimeSec,
        }),
      })
      // начинаем новый сегмент
      points = []
      arrows = []
      segmentDistance = 0
      arrowDistance = 0
      lastArrowPos = null
    }

    let used: LogRecord[] = []

    for (let i = 0; i < log.records.length; i++) {
      const rec = log.records[i]
      const prev = log.records[i - 1]

      points.push(rec.coordinates)
      used.push(rec)

      if (prev) {
        const d = getDistanceBetweenPoints(prev.coordinates, rec.coordinates)
        segmentDistance += d
        if (lastArrowPos) {
          arrowDistance += getDistanceBetweenPoints(
            lastArrowPos,
            rec.coordinates,
          )
        }
      }

      if (!lastArrowPos || arrowDistance >= MAX_ARROW_DISTANCE_M) {
        arrows.push({ position: rec.coordinates, bearingDeg: rec.headingDeg })
        lastArrowPos = rec.coordinates
        arrowDistance = 0
      }

      if (segmentDistance >= MAX_SEGMENT_DISTANCE_M) {
        flush(used)
        // начинаем новую выборку с ТЕКУЩЕЙ записи,
        // не трогаем i — счётчик продолжит движение вперёд
        points.push(rec.coordinates)
        used = [rec]
      }
    }

    flush(used)
    return res
  }, [log?.records, getConfig])

  return (
    <>
      {segments.map((segment, index) => (
        <div key={index}>
          <Polyline
            positions={segment.points}
            pathOptions={{
              ...DEFAULT_PATH_OPTIONS,
              opacity: segment.config.opacity ?? DEFAULT_PATH_OPTIONS.opacity,
              color: segment.config.color ?? DEFAULT_PATH_OPTIONS.color,
              weight: segment.config.weight ?? DEFAULT_PATH_OPTIONS.weight,
            }}
          >
            {segment.config.popoverText && (
              <Popup>
                <div>{segment.config.popoverText}</div>
              </Popup>
            )}
          </Polyline>

          {segment.arrows.map((arrow, arrowIndex) => (
            <Marker
              key={`arrow-${index}-${arrowIndex}`}
              position={arrow.position}
              icon={createRotatedArrowIcon(
                arrow.bearingDeg,
                segment.config.color,
              )}
            />
          ))}
        </div>
      ))}
    </>
  )
}

export default MapLogPathRenderer
