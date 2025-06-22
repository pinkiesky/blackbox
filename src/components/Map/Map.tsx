import {
  type FC,
  useEffect,
  useState,
  useCallback,
  type MouseEvent,
} from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { IconButton, Menu, MenuItem, ListItemText, Box } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import type { CSSProperties } from '@mui/material'
import 'leaflet-providers'
import { interpolateHsl } from 'd3-interpolate'
import type { Segment } from '@/types/data'
import { useLogStore } from '@/store/log.ts'
import { useMapPositions } from '@/hooks/useMapPositions'
import { StartIcon } from '@/components/icons/StartIcon'
import { FinishIcon } from '@/components/icons/FinishIcon'
import MapLogPathRenderer, {
  type GetSegmentConfigOptions,
} from '../MapPolylines/MapLogPathRenderer'
import type { LogStatistics } from '@/parse/types'

interface Props {
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

const Map: FC<Props> = ({ stat }) => {
  const { log } = useLogStore()
  const [selectedProvider, setSelectedProvider] = useState<MapProvider>(
    mapProviders[0],
  )
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const lchCb = useCallback(
    (opts: GetSegmentConfigOptions): Segment['config'] => {
      const avgSegmentAltitudeM =
        opts.usedRecords.reduce((acc, record) => acc + record.altitudeM, 0) /
        opts.usedRecords.length
      const color = interpolateHsl(
        'green',
        'red',
      )(avgSegmentAltitudeM / stat.altitude.max)
      return {
        opacity: 0.7,
        color,
        weight: 7,
      }
    },
    [stat],
  )

  const {
    startPosition,
    finishPosition,
    centerPosition,
    initCenterPosition,
    initPath,
    initStartPosition,
    initFinishPosition,
  } = useMapPositions(log)

  useEffect(() => {
    initCenterPosition()
    initPath()
    initStartPosition()
    initFinishPosition()
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

            <MapLogPathRenderer log={log!} getConfig={lchCb} />
          </MapContainer>
        </Box>
      )}
    </>
  )
}

export default Map
