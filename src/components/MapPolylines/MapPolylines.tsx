import { type FC, useEffect, useRef } from 'react'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import { Polyline, Tooltip, useMap } from 'react-leaflet'
import { getPathColor } from '@/utils/path'
import { parseDate } from '@/utils/date'
import { parseGpsLocation } from '@/utils/gps'
import { useDataStore } from '@/store/data.ts'
import { useFiltersStore } from '@/store/filters.ts'
import { FiltersType } from '@/types/filters.ts'

interface Props {
  segments: LatLngExpression[][]
}

const MapPolylines: FC<Props> = ({ segments }) => {
  const { data } = useDataStore()
  const { filters } = useFiltersStore()
  const map = useMap()

  const polylineRefs = useRef<{ [idx: number]: L.Polyline | null }>({})

  useEffect(() => {
    Object.values(polylineRefs.current).forEach((pl) => pl?.closeTooltip())

    const altitude = filters[FiltersType.ALTITUDE]
    if (!altitude) return

    const idx = data.findIndex((rec) => {
      const isAltEqual = rec['Alt(m)'] === altitude.item

      const isDateEqual = rec.Date === altitude.date
      const isTimeEqual = rec.Time.split('.')[0] === altitude.time

      return isAltEqual && isDateEqual && isTimeEqual
    })
    if (idx < 0) return

    const loc = parseGpsLocation(data[idx].GPS)
    if (loc) {
      map.flyTo({ lat: loc.lat, lng: loc.lng }, 18)
    }

    polylineRefs.current[idx + 1]?.openTooltip()
  }, [filters, data, map])

  return (
    <>
      {segments.map((segment, idx) => {
        const rec = data[idx + 1]
        const color = getPathColor(Number(rec['Alt(m)']))

        return (
          <Polyline
            key={idx}
            positions={segment}
            pathOptions={{ color, weight: 6 }}
            ref={(el) => {
              if (el) polylineRefs.current[idx] = el
            }}
          >
            <Tooltip direction="top" sticky>
              <strong>Altitude:</strong> {rec['Alt(m)']} m<br />
              <strong>Time:</strong> {parseDate(rec.Date, rec.Time)}
              <br />
              <strong>Speed:</strong> {rec['GSpd(kmh)']} km/h
              <br />
              <strong>Heading:</strong> {rec['Hdg(°)']}°<br />
              <strong>Sats:</strong> {rec['Sats']}
              <br />
              <strong>Bat:</strong> {rec['Bat%(%)']}%
            </Tooltip>
          </Polyline>
        )
      })}
    </>
  )
}

export default MapPolylines
