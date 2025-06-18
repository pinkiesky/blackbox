import L from 'leaflet'
import Icon from '@/assets/icons/start.svg'

export const StartIcon = new L.Icon({
  iconUrl: Icon,
  iconRetinaUrl: Icon,
  iconSize: new L.Point(54, 54),
  iconAnchor: new L.Point(27, 54),
})
