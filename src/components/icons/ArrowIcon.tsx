import L from 'leaflet'

export const ArrowIcon = L.divIcon({
  html: `
    <div style="
      width: 0; 
      height: 0; 
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 12px solid #0066ff;
      transform-origin: center;
    "></div>
  `,
  className: 'arrow-icon',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

export const createRotatedArrowIcon = (rotation: number) =>
  L.divIcon({
    html: `
    <div style="
      width: 0; 
      height: 0; 
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 12px solid #0066ff;
      transform: rotate(${rotation}deg);
      transform-origin: center;
    "></div>
  `,
    className: 'arrow-icon',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
