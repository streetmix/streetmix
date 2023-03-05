import React, { useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Marker } from 'react-leaflet'

function LocationMarker ({
  position,
  geocodeAvailable,
  onDragStart,
  onDragEnd
}) {
  const ref = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragstart (event) {
        const marker = ref.current
        if (marker !== null) {
          onDragStart(event)
        }
      },
      dragend (event) {
        const marker = ref.current
        if (marker !== null) {
          onDragEnd(event)
        }
      }
    }),
    [onDragStart, onDragEnd]
  )

  return position
    ? (
      <Marker
        ref={ref}
        position={position}
        draggable={geocodeAvailable}
        eventHandlers={eventHandlers}
      />
      )
    : null
}

LocationMarker.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  geocodeAvailable: PropTypes.bool,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired
}

export default LocationMarker
