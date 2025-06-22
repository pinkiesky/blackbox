export interface LocationData {
  lat: number
  lng: number
  alt: number // optional altitude
}

export interface Segment {
  points: LocationData[]
  config: {
    opacity?: number
    color?: string
    popoverText?: string // text to show in the popover
    weight?: number // line width
  }
}

export interface Arrow {
  position: LatLngLiteral
  bearingDeg: number // in degrees
}
