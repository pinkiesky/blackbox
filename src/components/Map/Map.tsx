import { type FC, useEffect, useState } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
} from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import { parseGpsLocation } from '@/utils/gps'
import { getPathColor } from '@/utils/path'
import { parseDate } from '@/utils/date'
import type { DataRecord, LocationData } from '@/types/data'

import styles from './Map.module.css'

interface Props {
  data: DataRecord[]
}

const Map: FC<Props> = ({ data }) => {
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

  useEffect(() => {
    initCenterPosition()
    initPath()
    initStartPosition()
    initFinishPosition()

    console.log(data)
  }, [data])

  return (
    <>
      {centerPosition && (
        <MapContainer center={centerPosition} zoom={15} className={styles.map}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {startPosition && (
            <Marker position={startPosition}>
              <Popup>Flight origin point</Popup>
            </Marker>
          )}

          {finishPosition && (
            <Marker position={finishPosition}>
              <Popup>Flight end point</Popup>
            </Marker>
          )}

          {segments.map((segment, idx) => {
            const record = data[idx + 1]
            const color = getPathColor(Number(record['Alt(m)']))

            return (
              <Polyline
                key={idx}
                positions={segment}
                pathOptions={{ color }}
                weight={6}
              >
                <Tooltip direction="top" sticky>
                  <div>
                    <strong>Altitude:</strong> {record['Alt(m)']} m<br />
                    <strong>Time:</strong> {parseDate(record.Date, record.Time)}
                  </div>
                </Tooltip>
              </Polyline>
            )
          })}
        </MapContainer>
      )}
    </>
  )
}

export default Map
