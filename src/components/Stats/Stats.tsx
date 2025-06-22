import { type FC, useMemo } from 'react'
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
import type { LogStatistics } from '@/parse/types'

interface Props {
  stat: LogStatistics
}

const Stats: FC<Props> = ({ stat }) => {
  const list = useMemo(() => {
    if (!stat) return []

    return [
      {
        icon: <HeightIcon color="info" />,
        title: 'Altitude',
        min: `${stat.altitude.min}m`,
        max: `${stat.altitude.max}m`,
      },
      {
        icon: <AirplaneIcon color="info" />,
        title: 'Total distance',
        text: `${stat.totalDistanceM.toFixed(0)}m`,
      },
      {
        icon: <PowerIcon color="info" />,
        title: 'Transmitter power',
        min: `${stat.transmitterPowerMw.min}mw`,
        max: `${stat.transmitterPowerMw.max}mw`,
      },
      {
        icon: <LinkIcon color="info" />,
        title: 'Transmitter link quality',
        min: `${stat.transmitterLinkQuality.min}%`,
        max: `${stat.transmitterLinkQuality.max}%`,
      },
    ]
  }, [stat])

  return (
    <>
      {stat && (
        <List disablePadding>
          {list.map((item, idx) => (
            <ListItem sx={{ paddingTop: idx === 0 ? '0' : '0.2rem' }}>
              <ListItemAvatar>
                <Avatar sx={{ backgroundColor: '#4c4848' }}>{item.icon}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography color="white" fontWeight="bold">
                    {item.title}
                  </Typography>
                }
                secondary={
                  item.text ? (
                    <Typography color="white">{item.text}</Typography>
                  ) : (
                    <>
                      <Grid container spacing={1} marginTop={0.5}>
                        <Chip
                          label={`min: ${item.min}`}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          label={`max: ${item.max}`}
                          color="error"
                          size="small"
                        />
                      </Grid>
                    </>
                  )
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </>
  )
}

export default Stats
