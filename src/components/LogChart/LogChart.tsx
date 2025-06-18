import { type FC, useEffect, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Box } from '@mui/material'
import { useDataStore } from '@/store/data.ts'
import { getDraggableSelectRangeConfig } from '@/utils/chart'
import { parseDate } from '@/utils/date'

const LogChart: FC = () => {
  const { data } = useDataStore()

  const lineRef = useRef<any>(null)
  const [altitude, setAltitude] = useState<number[]>([])
  const [dates, setDates] = useState<string[]>([])

  useEffect(() => {
    if (!data) return

    const altitudeData = data.data.map((log) => log.altitude)
    const dates = data.data.map((log) =>
      parseDate(log.date, '', {
        dateFormat: 'HH:mm:ss',
      }),
    )

    setAltitude(altitudeData)
    setDates(dates)
  }, [data])

  function getBackgroundColor() {
    if (!lineRef.current) return

    const canvas = lineRef.current.canvas
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, 'rgba(141,193,255,1)')
    gradient.addColorStop(1, 'rgba(141,193,255,0)')

    return gradient
  }

  return (
    <Box>
      <Line
        ref={lineRef}
        options={{
          responsive: true,
          plugins: {
            // @ts-ignore
            draggableSelectRange: getDraggableSelectRangeConfig(),
          },
        }}
        data={{
          labels: dates,
          datasets: [
            {
              data: altitude,
              pointRadius: 0,
              pointHoverRadius: 0,
              borderColor: '#2388FF',
              backgroundColor: getBackgroundColor(),
              fill: true,
            },
          ],
        }}
      />
    </Box>
  )
}

export default LogChart
