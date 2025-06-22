import { type ChangeEvent, type FC, Fragment } from 'react'
import {
  Box,
  Checkbox,
  type CSSProperties,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { useChartSettingsStore } from '@/store/chart-settings.ts'
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'

const styles: Record<string, CSSProperties> = {
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
}

const LogChartSettings: FC = () => {
  const { settings, setSettings } = useChartSettingsStore()

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target

    setSettings({
      ...settings,
      [name]: checked,
    })
  }

  return (
    <PopupState variant="popover" popupId="demo-popup-menu">
      {(popupState) => (
        <Fragment>
          <Box sx={styles.container}>
            <IconButton
              size="small"
              sx={{ margin: 0.2 }}
              {...bindTrigger(popupState)}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
          <Menu {...bindMenu(popupState)}>
            <MenuItem>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.altitudeM}
                    name="altitudeM"
                    size="small"
                    sx={{ padding: '6px' }}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Altitude"
              />
            </MenuItem>
            <MenuItem>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.groundSpeedKmh}
                    name="groundSpeedKmh"
                    size="small"
                    sx={{ padding: '6px' }}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Ground Speed"
              />
            </MenuItem>
          </Menu>
        </Fragment>
      )}
    </PopupState>
  )
}

export default LogChartSettings
