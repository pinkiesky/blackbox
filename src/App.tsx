import { parse } from 'csv-parse/browser/esm'
import { type ChangeEvent, useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Button, styled } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Tooltip,
} from 'react-leaflet'
import type { DataRecord } from './types/Data'

import './App.css'
import type { LatLngExpression } from 'leaflet'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

interface LocationData {
  lat: number
  lng: number
}

function App() {
  const [parsedData, setParsedData] = useState<DataRecord[]>([])
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
    if (parsedData.length === 0) return

    const arrayCenterIndex = Math.floor(parsedData.length / 2)

    const gps = parsedData[arrayCenterIndex].GPS
    if (!gps) return

    const [lat, lng] = gps.split(' ').map(Number)
    if (isNaN(lat) || isNaN(lng)) return

    setCenterPosition({ lat, lng })
  }

  const initPath = () => {
    if (parsedData.length === 0) return

    const newPath: LocationData[] = parsedData
      .map((record) => {
        const gps = record.GPS
        if (!gps) return null

        const [lat, lng] = gps.split(' ').map(Number)
        if (isNaN(lat) || isNaN(lng)) return null

        return { lat, lng }
      })
      .filter((location): location is LocationData => location !== null)

    setPath(newPath)
  }

  const initStartPosition = () => {
    if (parsedData.length === 0) return

    const gps = parsedData[0].GPS
    if (!gps) return

    const [lat, lng] = gps.split(' ').map(Number)
    if (isNaN(lat) || isNaN(lng)) return

    setStartPosition({ lat, lng })
  }

  const initFinishPosition = () => {
    if (parsedData.length === 0) return

    const gps = parsedData[parsedData.length - 1].GPS
    if (!gps) return

    const [lat, lng] = gps.split(' ').map(Number)
    if (isNaN(lat) || isNaN(lng)) return

    setFinishPosition({ lat, lng })
  }

  useEffect(() => {
    initCenterPosition()
    initPath()
    initStartPosition()
    initFinishPosition()
  }, [parsedData])

  const parseDate = (date: string, time: string) => {
    if (!date && !time) return ''

    const fullDate = `${date} ${time}`
    return format(parseISO(fullDate), 'dd.MM.yyyy HH:mm:ss')
  }

  const getPathColor = (alt: number): string => {
    if (alt < 50) return 'green'

    if (alt < 100) return 'yellow'

    return 'red'
  }

  const onUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()

    parse(
      text,
      {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      },
      (err, records) => {
        if (err) {
          console.error(err)
          return
        }

        setParsedData(records)
        console.log(records)
      },
    )
  }

  return (
    <>
      {parsedData.length === 0 && (
        <>
          <h1>Blackbox</h1>

          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            size="large"
            startIcon={<CloudUploadIcon />}
          >
            Import .CSV file
            <VisuallyHiddenInput
              type="file"
              onChange={onUploadFile}
              accept=".csv"
            />
          </Button>
        </>
      )}

      {parsedData.length > 0 && centerPosition && (
        <MapContainer center={centerPosition} zoom={15} className="map">
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
            const record = parsedData[idx + 1]
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

export default App
