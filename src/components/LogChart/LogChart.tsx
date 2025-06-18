import { type FC, useEffect, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Box } from '@mui/material'
import { getDraggableSelectRangeConfig } from '@/utils/chart'
import { useDataStore } from '@/store/data.ts'
import type { LocationData } from '@/types/data'

const LogChart: FC = () => {
  const { data } = useDataStore()

  const lineRef = useRef<any>(null)
  const [verticalPositions, setVerticalPositions] = useState<number[]>([])
  const [horizontalPositions, setHorizontalPositions] = useState<number[]>([])

  useEffect(() => {
    if (!data) return

    const positions: LocationData[] = data.data.map((log) => log.coordinates)
    const vertical = positions.map((pos) => pos.lat)
    const horizontal = positions.map((pos) => pos.lng)

    setVerticalPositions(vertical)
    setHorizontalPositions(horizontal)
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
          labels: horizontalPositions,
          datasets: [
            {
              data: verticalPositions,
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
