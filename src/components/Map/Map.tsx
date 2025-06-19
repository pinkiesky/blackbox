import { type FC, useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { IconButton, Menu, MenuItem, ListItemText, Box } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import type { CSSProperties } from '@mui/material'
import type {
  Arrow,
  LocationData,
  Log,
  LogRecord,
  LogStatistics,
  Segment,
} from '@/types/data'
import { useMapPositions } from '@/hooks/useMapPositions'
import { StartIcon } from '@/components/icons/StartIcon'
import { FinishIcon } from '@/components/icons/FinishIcon'
import MapPolylines from '@/components/MapPolylines/MapPolylines.tsx'
import 'leaflet-providers'
import MapArrows from '../MapPolylines/MapArrows'
import { LatLng } from 'leaflet'
import { interpolateHsl } from 'd3-interpolate'

function getDistanceBetweenPoints(
  coordinates: LocationData,
  coordinates1: LocationData,
) {
  return new LatLng(coordinates.lat, coordinates.lng).distanceTo(
    new LatLng(coordinates1.lat, coordinates1.lng),
  )
}

interface Props {
  data: Log
  stat: LogStatistics
}

interface MapProvider {
  name: string
  url: string
  attribution: string
}

const mapProviders: MapProvider[] = [
  {
    name: 'Satellite (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
  },
  {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    name: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    name: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    name: 'Stamen Terrain',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
]

const styles: Record<string, CSSProperties> = {
  map: {
    width: '100%',
    height: '100%',
    minWidth: '1000px',
    minHeight: '900px',
    borderRadius: '4px',
  },
  settingsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  mapContainer: {
    position: 'relative',
  },
}

function lch(
  record: LogRecord,
  log: Log,
  stat: LogStatistics,
): Segment['config'] {
  if (
    record.$resample &&
    record.$resample.deviationSec &&
    record.$resample.deviationSec > 3
  ) {
    return { opacity: 0.2, color: '#000' }
  }

  const perc = Math.min(
    1,
    record.transmitterPowerMw / stat.transmitterPowerMw.max,
  )
  const color = interpolateHsl('green', 'red')(perc)
  return {
    opacity: 0.9,
    color,
    popoverText: `Power: ${record.transmitterPowerMw} mW, ftime: ${record.flightTimeSec}`,
  }
}

const Map: FC<Props> = ({ data, stat }) => {
  const [selectedProvider, setSelectedProvider] = useState<MapProvider>(
    mapProviders[0],
  )
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const {
    startPosition,
    finishPosition,
    centerPosition,
    segments,
    initCenterPosition,
    initPath,
    initStartPosition,
    initFinishPosition,
  } = useMapPositions(data, stat, lch)

  useEffect(() => {
    initCenterPosition()
    initPath()
    initStartPosition()
    initFinishPosition()
  }, [data])

  const arrows = useMemo((): Arrow[] => {
    const arrowInterval = 1000 // 500 meters
    const arrows: Arrow[] = []
    let distanceAccumulator: number = 0

    for (let i = 0; i < data.records.length - 1; i++) {
      const start = data.records[i]
      const end = data.records[i + 1]
      const distance = getDistanceBetweenPoints(
        start.coordinates,
        end.coordinates,
      )
      distanceAccumulator += distance

      if (distanceAccumulator >= arrowInterval) {
        arrows.push({
          position: end.coordinates,
          bearingDeg: end.headingDeg,
        })

        distanceAccumulator = 0 // Reset the accumulator after placing an arrow
      }
    }

    return arrows
  }, [data])

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleProviderSelect = (provider: MapProvider) => {
    setSelectedProvider(provider)
    handleClose()
  }

  return (
    <>
      {centerPosition && (
        <Box style={styles.mapContainer}>
          <Box style={styles.settingsContainer}>
            <IconButton
              onClick={handleSettingsClick}
              size="small"
              sx={{ margin: 1 }}
            >
              <SettingsIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {mapProviders.map((provider) => (
                <MenuItem
                  key={provider.name}
                  onClick={() => handleProviderSelect(provider)}
                  selected={selectedProvider.name === provider.name}
                >
                  <ListItemText primary={provider.name} />
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <MapContainer center={centerPosition} zoom={16} style={styles.map}>
            <TileLayer
              key={selectedProvider.name}
              attribution={selectedProvider.attribution}
              url={selectedProvider.url}
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
            <MapArrows arrows={arrows} />
          </MapContainer>
        </Box>
      )}
    </>
  )
}

export default Map
