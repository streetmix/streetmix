import { useRef, useMemo } from 'react'
import { Marker } from 'react-leaflet'

import type { LeafletEvent, LeafletEventHandlerFn } from 'leaflet'
import type { LatLngObject } from '@streetmix/types'

interface LocationMarkerProps {
  position: LatLngObject
  geocodeAvailable: boolean
  onDragStart: LeafletEventHandlerFn
  onDragEnd: LeafletEventHandlerFn
}

function LocationMarker({
  position,
  geocodeAvailable,
  onDragStart,
  onDragEnd,
}: LocationMarkerProps) {
  const ref = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragstart(event: LeafletEvent) {
        const marker = ref.current
        if (marker !== null) {
          onDragStart(event)
        }
      },
      dragend(event: LeafletEvent) {
        const marker = ref.current
        if (marker !== null) {
          onDragEnd(event)
        }
      },
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
