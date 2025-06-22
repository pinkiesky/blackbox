import { useMemo, type FC } from 'react'
import { type PathOptions } from 'leaflet'
import { Polyline, Popup, Marker } from 'react-leaflet'
import type { Arrow, LocationData, Segment } from '@/types/data'
import { createRotatedArrowIcon } from '../icons/ArrowIcon'
import { getDistanceBetweenPoints } from '@/utils'
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
  log: Log
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

const MapLogPathRenderer: FC<Props> = ({ log, getConfig }) => {
  const segments: PathArrowSegment[] = useMemo(() => {
    if (!log?.records?.length) return []

    const segments: PathArrowSegment[] = []
    let currentPoints: LocationData[] = []
    let currentArrows: Arrow[] = []
    let usedRecords: LogRecord[] = []
    let segmentDistance = 0
    let arrowDistance = 0
    let lastArrowPosition: LocationData | null = null

    const finalizeSegment = () => {
      if (currentPoints.length > 0 && usedRecords.length > 0) {
        segments.push({
          points: [...currentPoints],
          arrows: [...currentArrows],
          config: getConfig({
            log,
            usedRecords: [...usedRecords],
            fromSec: usedRecords[0].flightTimeSec,
            toSec: usedRecords[usedRecords.length - 1].flightTimeSec,
          }),
        })
      }

      currentPoints = []
      currentArrows = []
      usedRecords = []
      segmentDistance = 0
      arrowDistance = 0
    }

    const addArrow = (record: LogRecord) => {
      currentArrows.push({
        position: record.coordinates,
        bearingDeg: record.headingDeg,
      })
      lastArrowPosition = record.coordinates
      arrowDistance = 0
    }

    for (let i = 0; i < log.records.length; i++) {
      const record = log.records[i]
      const prevRecord = log.records[i - 1]

      usedRecords.push(record)
      currentPoints.push(record.coordinates)

      // Calculate distance from previous record
      if (prevRecord) {
        const distance = getDistanceBetweenPoints(
          prevRecord.coordinates,
          record.coordinates,
        )
        segmentDistance += distance
        if (lastArrowPosition) {
          arrowDistance += getDistanceBetweenPoints(
            lastArrowPosition,
            record.coordinates,
          )
        }
      }

      // Add arrow if first point or distance threshold reached
      if (!lastArrowPosition || arrowDistance >= MAX_ARROW_DISTANCE_M) {
        addArrow(record)
      }

      // Finalize segment if distance threshold reached
      if (segmentDistance >= MAX_SEGMENT_DISTANCE_M) {
        finalizeSegment()
        i-- // Process current record again for next segment
      }
    }

    // Add final segment if there are remaining points
    finalizeSegment()

    return segments
  }, [log, getConfig])

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
