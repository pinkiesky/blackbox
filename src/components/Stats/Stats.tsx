import type { FC } from 'react'
import { useGlobalLogStatsStore } from '@/store/stats.ts'
import { Box, Typography } from '@mui/material'

const Stats: FC = () => {
  const { stats } = useGlobalLogStatsStore()

  return (
    <>
      {stats && (
        <Box textAlign="left">
          <Typography>
            Total distance (m): {stats.totalDistanceM.toFixed(0)}
          </Typography>
          <Typography>Max altitude: {stats.altitude.max}</Typography>
          <Typography>
            Transmitter power (mw): {stats.transmitterPowerMw.max}
          </Typography>
          <Typography>
            Ground speed (kmh): {stats.groundSpeedKmh.max}
          </Typography>
          <Typography>
            Transmitter link quality: {stats.transmitterLinkQuality.max}
          </Typography>
        </Box>
      )}
    </>
  )
}

export default Stats
