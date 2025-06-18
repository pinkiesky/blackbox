import { type FC, useRef } from 'react'
import { Chart } from 'react-chartjs-2'
import { Chart as ChartJS } from 'chart.js'
import { Box } from '@mui/material'

export const LogChart: FC = () => {
  const chartRef = useRef<ChartJS>(null)

  return (
    <Box>
      <Chart
        ref={chartRef}
        type="line"
        data={{
          labels: [1],
          datasets: [
            {
              label: 'My First Dataset',
              data: [65, 59, 80, 81, 56, 55, 40],
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        }}
        // plugins={{
        //   draggableSelectRange: {
        //     enable: true,
        //     text: {
        //       enable: true,
        //       offset: -15,
        //       padding: 1,
        //     },
        //     onSelectComplete: (event) => {
        //       console.log(event.range[0])
        //       console.log(event.range[1])
        //     },
        //   },
        // }}
      />
    </Box>
  )
}

export default LogChart
