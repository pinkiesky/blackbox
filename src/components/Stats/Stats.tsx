import type { FC } from 'react'
import { useGlobalLogStatsStore } from '@/store/stats.ts'
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Chip,
  Grid,
} from '@mui/material'
import HeightIcon from '@mui/icons-material/Height'
import AirplaneIcon from '@mui/icons-material/AirplanemodeActive'
import PowerIcon from '@mui/icons-material/Power'
import LinkIcon from '@mui/icons-material/Link'

const Stats: FC = () => {
  const { stats } = useGlobalLogStatsStore()

  return (
    <>
      {stats && (
        <List disablePadding>
          <ListItem sx={{ paddingTop: '0' }}>
            <ListItemAvatar>
              <Avatar sx={{ backgroundColor: '#4c4848' }}>
                <HeightIcon color="info" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography color="white" fontWeight="bold">
                  Altitude
                </Typography>
              }
              secondary={
                <Typography color="white">{stats.altitude.max}m</Typography>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ backgroundColor: '#4c4848' }}>
                <AirplaneIcon color="info" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography color="white" fontWeight="bold">
                  Total distance
                </Typography>
              }
              secondary={
                <Typography color="white">
                  {stats.totalDistanceM.toFixed(0)}m
                </Typography>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ backgroundColor: '#4c4848' }}>
                <PowerIcon color="info" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography color="white" fontWeight="bold">
                  Transmitter power
                </Typography>
              }
              secondary={
                <Grid container spacing={1} marginTop={0.5}>
                  <Chip
                    label={`min: ${stats.transmitterPowerMw.min}mw`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={`max: ${stats.transmitterPowerMw.max}mw`}
                    color="error"
                    size="small"
                  />
                </Grid>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ backgroundColor: '#4c4848' }}>
                <LinkIcon color="info" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography color="white" fontWeight="bold">
                  Transmitter link quality
                </Typography>
              }
              secondary={
                <Grid container spacing={1} marginTop={0.5}>
                  <Chip
                    label={`min: ${stats.transmitterLinkQuality.min}%`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={`max: ${stats.transmitterLinkQuality.max}%`}
                    color="error"
                    size="small"
                  />
                </Grid>
              }
            />
          </ListItem>
        </List>
      )}
    </>
  )
}

export default Stats
