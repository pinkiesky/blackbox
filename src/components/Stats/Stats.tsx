import { type FC, useMemo } from 'react'
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Chip,
} from '@mui/material'
import HeightIcon from '@mui/icons-material/Height'
import AirplaneIcon from '@mui/icons-material/AirplanemodeActive'
import PowerIcon from '@mui/icons-material/Power'
import LinkIcon from '@mui/icons-material/Link'
import type { LogStatistics } from '@/parse/types'

interface Props {
  stat: LogStatistics
}

const styles = {
  chip: {
    marginTop: '0.2rem',
    marginRight: '0.4rem',
  },
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
            <ListItem sx={{ paddingTop: idx === 0 ? '0' : '0.2rem' }} key={idx}>
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
                      <Chip
                        component="span"
                        label={`min: ${item.min}`}
                        sx={styles.chip}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        component="span"
                        label={`max: ${item.max}`}
                        color="error"
                        size="small"
                      />
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
