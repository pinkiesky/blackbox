import { type FC, useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import type { CSSProperties } from '@mui/material'
import type { Log, LogRecord } from '@/types/data'
import { useMapPositions } from '@/hooks/useMapPositions'
import { getColorBetweenTwoColors } from '@/utils'
import { StartIcon } from '@/components/icons/StartIcon'
import { FinishIcon } from '@/components/icons/FinishIcon'
import MapPolylines from '@/components/MapPolylines/MapPolylines.tsx'

interface Props {
  data: Log
}

const styles: Record<string, CSSProperties> = {
  map: {
    width: '100%',
    height: '100%',
    minWidth: '1000px',
    minHeight: '900px',
    borderRadius: '4px',
  },
}

function lch(record: LogRecord): { opacity: number; color: string } {
  if (
    record.$resample &&
    record.$resample.deviationSec &&
    record.$resample.deviationSec > 3
  ) {
    return { opacity: 0.2, color: '#000' }
  }

  const color = getColorBetweenTwoColors(
    '#ff0000',
    '#00ff00',
    record.amperageCurrentA / 20,
  )
  return { opacity: 0.7, color }
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
  } = useMapPositions(data, lch)

  useEffect(() => {
    initCenterPosition()
    initPath()
    initStartPosition()
    initFinishPosition()
  }, [data])

  return (
    <>
      {centerPosition && (
        <MapContainer center={centerPosition} zoom={16} style={styles.map}>
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

          <MapPolylines segments={segments} />
        </MapContainer>
      )}
    </>
  )
}

export default Map
