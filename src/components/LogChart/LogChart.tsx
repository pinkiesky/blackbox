import { type FC, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { Line } from 'react-chartjs-2'
import { Box } from '@mui/material'
import { useLogStore } from '@/store/log.ts'
import {
  type DraggableSelectEvent,
  getDraggableSelectRangeConfig,
} from '@/utils/chart'
import type { ScriptableContext } from 'chart.js'

interface Props {
  onSelect: (event: DraggableSelectEvent) => void
}

const LogChart: FC<Props> = ({ onSelect }) => {
  const { log } = useLogStore()

  const lineRef = useRef<any>(null)
  const [altitudeM, setAltitudeM] = useState<number[]>([])
  const [dates, setDates] = useState<string[]>([])

  useEffect(() => {
    if (!log) return

    const altitudeMData = log.records.map((log) => log.altitudeM)
    const dates = log.records.map((log) => format(log.date, 'HH:mm:ss'))

    setAltitudeM(altitudeMData)
    setDates(dates)
  }, [log])

  function getBackgroundColor(context: ScriptableContext<'line'>) {
    if (!context.chart.chartArea) return

    const {
      ctx,
      chartArea: { top, bottom },
    } = context.chart
    const gradient = ctx.createLinearGradient(0, top, 0, bottom)
    gradient.addColorStop(0, 'rgba(141,193,255,1)')
    gradient.addColorStop(1, 'rgba(141,193,255,0)')

    return gradient
  }

  return (
    <Box>
      <Line
        ref={lineRef}
        width={1280}
        height={700}
        options={{
          responsive: true,
          plugins: {
            // @ts-ignore
            draggableSelectRange: getDraggableSelectRangeConfig({
              onSelect,
            }),
          },
        }}
        data={{
          labels: dates,
          datasets: [
            {
              label: 'Altitude',
              data: altitudeM,
              pointRadius: 0,
              pointHoverRadius: 0,
              borderColor: '#2388FF',
              backgroundColor: (context) => getBackgroundColor(context),
              fill: true,
            },
          ],
        }}
      />
    </Box>
  )
}

export default LogChart
