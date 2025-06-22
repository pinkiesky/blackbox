import L from 'leaflet'
import Icon from '@/assets/icons/finish.svg'

export const FinishIcon = new L.Icon({
  iconUrl: Icon,
  iconRetinaUrl: Icon,
  iconSize: new L.Point(54 / 2, 54 / 2),
  iconAnchor: new L.Point(27 / 2, 54 / 2),
})
