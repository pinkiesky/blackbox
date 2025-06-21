import { type FC, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Box,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import type { CSSProperties } from '@mui/material'
import { LatLng } from 'leaflet'
import 'leaflet-providers'
import { interpolateHsl } from 'd3-interpolate'
import type {
  Arrow,
  LocationData,
  LogRecord,
  LogStatistics,
  Segment,
} from '@/types/data'
import { type MapProvider, mapProviders } from '@/utils/providers.ts'
import { useLogStore } from '@/store/log.ts'
import { useMapPositions } from '@/hooks/useMapPositions'
import { StartIcon } from '@/components/icons/StartIcon'
import { FinishIcon } from '@/components/icons/FinishIcon'
import MapPolylines from '@/components/MapPolylines/MapPolylines.tsx'
import MapArrows from '../MapPolylines/MapArrows'

function getDistanceBetweenPoints(
  coordinates: LocationData,
  coordinates1: LocationData,
) {
  return new LatLng(coordinates.lat, coordinates.lng).distanceTo(
    new LatLng(coordinates1.lat, coordinates1.lng),
  )
}

const styles: Record<string, CSSProperties> = {
  map: {
    width: '100%',
    height: '100%',
    minWidth: '1236px',
    minHeight: '500px',
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

function lch(record: LogRecord, stat: LogStatistics): Segment['config'] {
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

const Map: FC = () => {
  const { log } = useLogStore()
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
  } = useMapPositions(lch)

  useEffect(() => {
    initCenterPosition()
    initPath()
    initStartPosition()
    initFinishPosition()
  }, [log])

  const arrows = useMemo((): Arrow[] => {
    if (!log) return []

    const arrowInterval = 1000 // 500 meters
    const arrows: Arrow[] = []
    let distanceAccumulator: number = 0

    for (let i = 0; i < log.records.length - 1; i++) {
      const start = log.records[i]
      const end = log.records[i + 1]
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
  }, [log])

  const handleSettingsClick = (event: MouseEvent<HTMLElement>) => {
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
              <Divider />
              <MenuItem>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={true}
                      name="altitude"
                      size="small"
                      sx={{ padding: '6px' }}
                    />
                  }
                  label="Altitude"
                />
              </MenuItem>
              <MenuItem>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={true}
                      name="battery"
                      size="small"
                      sx={{ padding: '6px' }}
                    />
                  }
                  label="Battery"
                />
              </MenuItem>
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
