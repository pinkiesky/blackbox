import { type FC, useEffect } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
} from 'react-leaflet'
import type { DataRecord } from '@/types/data'
import { getPathColor } from '@/utils/path'
import { parseDate } from '@/utils/date'
import { useMapPositions } from '@/hooks/useMapPositions'
import { StartIcon } from '@/components/icons/StartIcon'
import { FinishIcon } from '@/components/icons/FinishIcon'

import styles from './Map.module.css'

interface Props {
  data: DataRecord[]
}

const Map: FC<Props> = ({ data }) => {
  const {
    startPosition,
    finishPosition,
    centerPosition,
    segments,
    initCenterPosition,
    initPath,
    initStartPosition,
    initFinishPosition,
  } = useMapPositions(data)

  useEffect(() => {
    initCenterPosition()
    initPath()
    initStartPosition()
    initFinishPosition()
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
            <Marker position={startPosition} icon={StartIcon}>
              <Popup>Flight origin point</Popup>
            </Marker>
          )}

          {finishPosition && (
            <Marker position={finishPosition} icon={FinishIcon}>
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
                  <strong>Altitude:</strong> {record['Alt(m)']} m
                  <br />
                  <strong>Time:</strong> {parseDate(record.Date, record.Time)}
                  <br />
                  <strong>Speed:</strong> {record['GSpd(kmh)']} km/h
                  <br />
                  <strong>Heading:</strong> {record['Hdg(°)']}°
                  <br />
                  <strong>Sats:</strong> {record['Sats']}
                  <br />
                  <strong>Bat:</strong> {record['Bat%(%)']}%
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
