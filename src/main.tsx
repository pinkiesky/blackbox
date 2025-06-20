import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
} from 'chart.js'
import DraggableSelectRangePlugin from 'chartjs-plugin-draggable-selectrange'
import App from './App.tsx'
import './index.css'

Chart.register(
  DraggableSelectRangePlugin,
  CategoryScale,
  Filler,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
