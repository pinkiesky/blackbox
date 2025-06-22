import { useMemo, type FC } from 'react'
import { type LatLngLiteral, type PathOptions } from 'leaflet'
import { Marker, Polyline, Popup } from 'react-leaflet'
import type { Arrow, LocationData, Segment } from '@/types/data'
import { getDistanceBetweenPoints } from '@/utils'
import { useLogStore } from '@/store/log.ts'
import type { Log, LogRecord } from '@/parse/types'
import { interpolateHsl } from 'd3-interpolate'
import { StartIcon } from '../icons/StartIcon'

// Types
export interface GetSegmentConfigOptions {
  log: Log
  usedRecords: LogRecord[]
  fromSec: number
  toSec: number
}

export type GetSegmentConfig = (
  options: GetSegmentConfigOptions,
) => Segment['config']

interface PathArrowSegment {
  arrows: Arrow[]
  points: LocationData[]
  config: Segment['config']
}

interface Props {
  getConfig: GetSegmentConfig
  enableUglyArrows?: boolean
}

// Constants
const DEFAULT_PATH_OPTIONS: PathOptions = {
  color: '#00f',
  weight: 4,
  opacity: 1,
  stroke: true,
  lineJoin: 'round',
  lineCap: 'round',
}

export function createTrianglePolyline(arrow: Arrow): LatLngLiteral[] {
  const { position, bearingDeg } = arrow
  const delta = 0.00005

  // Convert bearing to radians
  const bearingRad = (bearingDeg * Math.PI) / 180

  // Calculate the three triangle vertices
  // Tip of the triangle (pointing in the direction of bearing)
  const tip: LatLngLiteral = {
    lat: position.lat + delta * Math.cos(bearingRad),
    lng: position.lng + delta * Math.sin(bearingRad),
  }

  // Left base vertex (120 degrees counter-clockwise from bearing)
  const leftBaseAngle = bearingRad + (2 * Math.PI) / 3
  const leftBase: LatLngLiteral = {
    lat: position.lat + delta * 0.6 * Math.cos(leftBaseAngle),
    lng: position.lng + delta * 0.6 * Math.sin(leftBaseAngle),
  }

  // Right base vertex (120 degrees clockwise from bearing)
  const rightBaseAngle = bearingRad - (2 * Math.PI) / 3
  const rightBase: LatLngLiteral = {
    lat: position.lat + delta * 0.6 * Math.cos(rightBaseAngle),
    lng: position.lng + delta * 0.6 * Math.sin(rightBaseAngle),
  }

  // Return triangle polyline (closed shape)
  return [tip, leftBase, rightBase, tip]
}

const MAX_SEGMENT_DISTANCE_M = 100
const MAX_ARROW_DISTANCE_M = 75

const MapLogPathRenderer: FC<Props> = ({
  getConfig,
  enableUglyArrows = false,
}) => {
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
  }, [log, getConfig])

  const segmentsReversersed = useMemo(() => {
    return [...segments].reverse()
  }, [segments])

  const flightModeChangePoints: { loc: LocationData; fm: string }[] =
    useMemo(() => {
      const points: { loc: LocationData; fm: string }[] = []
      if (!log?.records?.length) return points

      for (let i = 0; i < log.records.length; i++) {
        const record = log.records[i]
        const prevFm = points[points.length - 1]

        if (record.flightMode !== prevFm?.fm) {
          points.push({
            loc: record.coordinates,
            fm: record.flightMode,
          })
        }
      }

      return points
    }, [log])

  return (
    <>
      {segmentsReversersed.map((segment, index) => (
        <div key={index}>
          <Polyline
            positions={segment.points}
            pathOptions={{
              ...DEFAULT_PATH_OPTIONS,
              opacity: 0.8,
              color: 'black',
              weight:
                (segment.config.weight ?? DEFAULT_PATH_OPTIONS.weight!) + 4,
            }}
          >
            {segment.config.popoverText && (
              <Popup>
                <div>{segment.config.popoverText}</div>
              </Popup>
            )}
          </Polyline>

          <Polyline
            positions={segment.points}
            pathOptions={{
              ...DEFAULT_PATH_OPTIONS,
              opacity: 1,
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

          {enableUglyArrows &&
            segment.arrows.map((arrow, arrowIndex) => {
              const points = createTrianglePolyline(arrow)
              const color = interpolateHsl(
                segment.config.color ?? DEFAULT_PATH_OPTIONS.color!,
                'black',
              )(0.5)
              return (
                <Polyline
                  key={arrowIndex}
                  positions={points}
                  pathOptions={{
                    ...DEFAULT_PATH_OPTIONS,
                    color: color,
                    weight: 1,
                    fill: true,
                    stroke: false,
                    fillOpacity: 0.9,
                  }}
                />
              )
            })}
        </div>
      ))}
      {flightModeChangePoints.map((point, index) => {
        return (
          <Marker key={index} position={point.loc} icon={StartIcon}>
            <Popup>
              <div>Flight mode: {point.fm}</div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

export default MapLogPathRenderer
