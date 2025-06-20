import { type FC } from 'react'
import { Marker } from 'react-leaflet'
import type { Arrow } from '@/types/data'
import { createRotatedArrowIcon } from '@/components/icons/ArrowIcon'

interface Props {
  arrows: Arrow[]
}

const MapArrows: FC<Props> = ({ arrows }) => {
  return (
    <>
      {arrows.map((arrow, index) => (
        <Marker
          key={index}
          position={arrow.position}
          icon={createRotatedArrowIcon(arrow.bearingDeg)}
        />
      ))}
    </>
  )
}

export default MapArrows
