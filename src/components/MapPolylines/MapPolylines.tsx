import { type FC } from 'react'
import { type PathOptions } from 'leaflet'
import { Polyline } from 'react-leaflet'
import type { Segment } from '@/types/data'

interface Props {
  segments: Segment[]
}

const MapPolylines: FC<Props> = ({ segments }) => {
  const pathOptions: PathOptions = {
    color: '#00f',
    weight: 3,
    opacity: 1,
    stroke: true,
  }

  return (
    <>
      {segments.map((segment, index) => (
        <Polyline
          key={index}
          positions={segment.points}
          pathOptions={{ 
            ...pathOptions,
            opacity: segment.config.opacity ?? pathOptions.opacity,
            color: segment.config.color ?? pathOptions.color,
          }}
        />
      ))}
    </>
  )
}

export default MapPolylines
