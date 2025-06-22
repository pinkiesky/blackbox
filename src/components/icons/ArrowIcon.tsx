import L from 'leaflet'

export const createRotatedArrowIcon = (rotation: number, color = '#0066ff') =>
  L.divIcon({
    html: `
    <div style="
      width: 0; 
      height: 0; 
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 12px solid ${color};
      transform: rotate(${rotation}deg);
      transform-origin: center;
    "></div>
  `,
    className: 'arrow-icon',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
