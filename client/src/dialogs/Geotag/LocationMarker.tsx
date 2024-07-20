import React, { useRef, useMemo } from 'react'
import { Marker } from 'react-leaflet'

import type { LeafletEvent } from 'leaflet'
import type { LatLngObject } from '@streetmix/types'

interface LocationMarkerProps {
  position: LatLngObject
  geocodeAvailable: boolean
  onDragStart: (event: LeafletEvent) => void
  onDragEnd: (event: LeafletEvent) => void
}

function LocationMarker ({
  position,
  geocodeAvailable,
  onDragStart,
  onDragEnd
}: LocationMarkerProps): React.ReactElement {
  const ref = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragstart (event: LeafletEvent) {
        const marker = ref.current
        if (marker !== null) {
          onDragStart(event)
        }
      },
      dragend (event: LeafletEvent) {
        const marker = ref.current
        if (marker !== null) {
          onDragEnd(event)
        }
      }
    }),
    [onDragStart, onDragEnd]
  )

  return (
    <Marker
      ref={ref}
      position={position}
      draggable={geocodeAvailable}
      eventHandlers={eventHandlers}
    />
  )
}

export default LocationMarker
