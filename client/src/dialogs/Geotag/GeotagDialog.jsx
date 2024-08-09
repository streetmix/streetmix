/* global L */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch, batch } from 'react-redux'
import { useIntl } from 'react-intl'
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  AttributionControl,
  useMapEvents
} from 'react-leaflet'

import { PELIAS_HOST_NAME, PELIAS_API_KEY } from '~/src/app/config'
import { isOwnedByCurrentUser } from '~/src/streets/owner'
import { setMapState } from '~/src/store/slices/map'
import {
  addLocation,
  clearLocation,
  saveStreetName
} from '~/src/store/slices/street'
import Dialog from '../Dialog'
import ErrorBanner from './ErrorBanner'
import GeoSearch from './GeoSearch'
import LocationPopup from './LocationPopup'
import LocationMarker from './LocationMarker'
import './GeotagDialog.scss'

const ukrainianFlag =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"/><path fill="#FFD500" d="M0 4h12v3H0z"/><path fill="#E0BC00" d="M0 7h12v1H0z"/></svg>'
const REVERSE_GEOCODE_API = `https://${PELIAS_HOST_NAME}/v1/reverse`
const REVERSE_GEOCODE_ENDPOINT = `${REVERSE_GEOCODE_API}?api_key=${PELIAS_API_KEY}`
const MAP_TILES =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
const MAP_TILES_2X =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution" target="_blank" rel="noopener noreferrer">CARTO</a>'
// This is the same attribution prefix as Leaflet v1.9.3, except that we set
// link target and rel properties. Have to keep this up to date, or possibly
// propose features to Leaflet.
const MAP_ATTRIBUTION_PREFIX = `<a href="https://leafletjs.com" title="A JavaScript library for interactive maps" target="_blank" rel="noopener noreferrer">${ukrainianFlag} Leaflet</a>`
// zoom level for a closer, 'street' zoom level
const MAP_LOCATION_ZOOM = 12
// Default location if geo IP not detected; this hovers over the Atlantic Ocean
const DEFAULT_MAP_ZOOM = 2
const DEFAULT_MAP_LOCATION = {
  lat: 10.45,
  lng: -10.78
}

// Override icon paths in stock Leaflet's stylesheet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png'
})

function getInitialState (props) {
  // Determine initial map center, and what to display
  let mapCenter, zoom, markerLocation, label

  // If street has a location object, use its position and data
  if (props.street.location) {
    mapCenter = props.street.location.latlng
    zoom = MAP_LOCATION_ZOOM
    markerLocation = props.street.location.latlng
    label = props.street.location.label
    /* If we've previously saved marker position, re-use that information
     This can be better described. This is an intermediary state that can happen when:

      1) A user is viewing a street without a geotagged location.
      They open the dialog box and search for a street location.
      A search result is selected and a marker is dropped on the map.

      2) Without confirming the location, the user exits the dialog box.
      Because a location is not confirmed, the street does not attach to the location.

      3) The user re-opens the dialog box.
      The previous state (with an unconfirmed location and map marker) is recovered.
      */
  } else if (props.markerLocation) {
    mapCenter = props.markerLocation
    zoom = MAP_LOCATION_ZOOM
    markerLocation = props.markerLocation
    label = props.addressInformation.label
    // If there's no prior location data, use the user's location, if available
    // In this case, display the map view, but no marker or popup
  } else if (props.userLocation && props.userLocation.longitude) {
    mapCenter = {
      lat: props.userLocation.latitude,
      lng: props.userLocation.longitude
    }
    zoom = MAP_LOCATION_ZOOM
    // As a last resort, show an overview of the world.
  } else {
    mapCenter = DEFAULT_MAP_LOCATION
    zoom = DEFAULT_MAP_ZOOM
  }

  return {
    mapCenter,
    zoom,
    markerLocation,
    label
  }
}

/*
This Dialog uses the generic Dialog component and combines it with the GeoSearch
and LocationPopup components as well as a map to display the coordinates on
It handles:
setting, displaying, and clearing location information associated with a 'street'
user permission checks for whether location can be updated for a street based on the user
reverse geocodeing based on user input (the user can click on the map to reverse geocode at the
  clicked point, or it can drag the marker to a new location to confirm)

It is tested primary via cypress at the moment
 */
function GeotagDialog () {
  // this kinda goofy props object is a result of refactoring
  // some legacy code. definetly worth refactoring further in the future
  // if it causes other problems or confusion
  const props = {
    street: useSelector((state) => state.street),
    markerLocation: useSelector((state) => state.map.markerLocation),
    addressInformation: useSelector((state) => state.map.addressInformation),
    userLocation: useSelector((state) => state.user.geolocation.data),
    offline: useSelector((state) => state.system.offline)
  }

  const dispatch = useDispatch()
  const initialState = getInitialState(props)
  const [mapCenter, setMapCenter] = useState(initialState.mapCenter)
  const [zoom, setZoom] = useState(initialState.zoom)
  const [markerLocation, setMarkerLocation] = useState(
    initialState.markerLocation
  )
  const [label, setLabel] = useState(initialState.label)
  const [renderPopup, setRenderPopup] = useState(!!initialState.markerLocation)
  const intl = useIntl()

  const geocodeAvailable =
    !!PELIAS_API_KEY && !!PELIAS_HOST_NAME && !props.offline

  // `dpi` is a bad name for what is supposed to be referring to the devicePixelRatio
  // value. A devicePixelRatio higher than 1 (e.g. Retina or 4k monitors) will load
  // higher resolution map tiles.
  const dpi = useSelector((state) => state.system.devicePixelRatio || 1.0)
  const tileUrl = dpi > 1 ? MAP_TILES_2X : MAP_TILES

  // Child component to handle click events in MapContainer
  function MapClick (props) {
    const map = useMapEvents({
      click (event) {
        if (!geocodeAvailable) return

        const latlng = event.latlng
        const zoom = map.getZoom()
        reverseGeocode(latlng).then((res) => {
          const latlng = {
            lat: res.features[0].geometry.coordinates[1],
            lng: res.features[0].geometry.coordinates[0]
          }
          setZoom(zoom)
          updateMap(latlng, res.features[0].properties, res.features[0].label)
        })
      }
    })

    return null
  }

  const handleMarkerDragStart = (event) => {
    setRenderPopup(false)
  }

  const handleMarkerDragEnd = (event) => {
    const latlng = event.target.getLatLng()
    reverseGeocode(latlng).then((res) => {
      updateMap(latlng, res.features[0].properties)
    })
  }

  const handleConfirmLocation = (event) => {
    const { markerLocation, addressInformation } = props

    const location = {
      latlng: markerLocation,
      wofId: addressInformation.id,
      label: addressInformation.label,
      hierarchy: {
        country: addressInformation.country,
        region: addressInformation.region,
        locality: addressInformation.locality,
        neighbourhood: addressInformation.neighbourhood,
        street: addressInformation.street
      },
      geometryId: null,
      intersectionId: null
    }

    batch(() => {
      dispatch(addLocation(location))
      dispatch(saveStreetName(location.hierarchy.street, false))
    })
  }

  const handleClearLocation = (event) => {
    dispatch(clearLocation())
  }

  const reverseGeocode = (latlng) => {
    const url = `${REVERSE_GEOCODE_ENDPOINT}&point.lat=${latlng.lat}&point.lon=${latlng.lng}`

    return window.fetch(url).then((response) => response.json())
  }

  // Search dialog state dosen't sync up with map state (IMO should clear or update with label)
  const handleSearchResults = (point, locationProperties) => {
    const latlng = {
      lat: point[0],
      lng: point[1]
    }
    updateMap(latlng, locationProperties)
  }

  function updateMap (latlng, locationProperties) {
    /*
    after the location position is updated,
    we need to update the map UI elements
    an update place information in the store
    */
    setRenderPopup(true)
    setMarkerLocation(latlng)
    setLabel(locationProperties.label)
    setMapCenter(latlng)

    dispatch(
      setMapState({
        markerLocation: latlng,
        addressInformation: locationProperties
      })
    )
  }

  /**
   * Determines if the street location can be saved or edited.
   */
  const canEditLocation = () => {
    const { street } = props
    // The street is editable if either of the following conditions are true:
    //  - If there is a street owner, and it's equal to the current user
    //  - If there is no street owner
    //  - If there is no street location saved.
    return isOwnedByCurrentUser() || !street.creatorId || !street.location
  }

  /**
   * Location can be cleared from a street that has a saved location, and
   * if that location is equal to the current marker position.
   * This does not check for street ownership. See `canEditLocation()` for that.
   */
  const canClearLocation = () => {
    const { location } = props.street

    return (
      location &&
      location.latlng.lat === markerLocation.lat &&
      location.latlng.lng === markerLocation.lng
    )
  }

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="geotag-dialog">
          {geocodeAvailable
            ? (
              <div className="geotag-input-container">
                <GeoSearch
                  handleSearchResults={handleSearchResults}
                  focus={mapCenter}
                />
              </div>
              )
            : (
              <ErrorBanner />
              )}
          <MapContainer
            center={mapCenter}
            zoomControl={false}
            attributionControl={false}
            zoom={zoom}
          >
            <TileLayer attribution={MAP_ATTRIBUTION} url={tileUrl} />
            <ZoomControl
              zoomInTitle={intl.formatMessage({
                id: 'dialogs.geotag.zoom-in',
                defaultMessage: 'Zoom in'
              })}
              zoomOutTitle={intl.formatMessage({
                id: 'dialogs.geotag.zoom-out',
                defaultMessage: 'Zoom out'
              })}
            />

            {renderPopup && markerLocation && (
              <LocationPopup
                position={markerLocation}
                label={label}
                isEditable={geocodeAvailable && canEditLocation()}
                isClearable={geocodeAvailable && canClearLocation()}
                handleConfirm={(e) => {
                  handleConfirmLocation(e)
                  closeDialog()
                }}
                handleClear={(e) => {
                  handleClearLocation(e)
                  closeDialog()
                }}
              />
            )}

            {markerLocation && (
              <LocationMarker
                position={markerLocation}
                geocodeAvailable={geocodeAvailable}
                onDragStart={handleMarkerDragStart}
                onDragEnd={handleMarkerDragEnd}
              />
            )}
            <MapClick />
            <AttributionControl prefix={MAP_ATTRIBUTION_PREFIX} />
          </MapContainer>
        </div>
      )}
    </Dialog>
  )
}

GeotagDialog.propTypes = {
  // Provided by Redux store
  street: PropTypes.object,
  markerLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  addressInformation: PropTypes.object,
  userLocation: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }),
  offline: PropTypes.bool
}

export default GeotagDialog
