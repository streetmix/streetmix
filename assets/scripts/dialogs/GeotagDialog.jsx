/* global L */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import { Map, TileLayer, ZoomControl, Marker } from 'react-leaflet'
// todo: re-enable sharedstreets
// sharedstreets functionality is disabled until it stops installing an old
// version of `npm` as a dependency.
// import * as sharedstreets from 'sharedstreets'
import Dialog from './Dialog'
import { PELIAS_HOST_NAME, PELIAS_API_KEY } from '../app/config'
import { trackEvent } from '../app/event_tracking'
import GeoSearch from './Geotag/GeoSearch'
import LocationPopup from './Geotag/LocationPopup'
import { getRemixOnFirstEdit } from '../streets/remix'
import { setMapState } from '../store/actions/map'
import { addLocation, clearLocation, saveStreetName } from '../store/actions/street'
import { clearDialogs } from '../store/actions/dialogs'
import './GeotagDialog.scss'

const REVERSE_GEOCODE_API = `https://${PELIAS_HOST_NAME}/v1/reverse`
const REVERSE_GEOCODE_ENDPOINT = `${REVERSE_GEOCODE_API}?api_key=${PELIAS_API_KEY}`
const MAP_TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
const MAP_TILES_2X = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
const MAP_LOCATION_ZOOM = 12

// Default location if geo IP not detected; this hovers over the Atlantic Ocean
const DEFAULT_MAP_ZOOM = 2
const DEFAULT_MAP_LOCATION = {
  lat: 10.450,
  lng: -10.780
}

// Override icon paths in stock Leaflet's stylesheet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png'
})

class GeotagDialog extends React.Component {
  static propTypes = {
    // Provided by react-intl higher-order component
    intl: intlShape.isRequired,

    // Provided by parent
    closeDialog: PropTypes.func,

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
    dpi: PropTypes.number,

    // Provided by Redux action dispatchers
    setMapState: PropTypes.func,
    addLocation: PropTypes.func,
    clearLocation: PropTypes.func,
    saveStreetName: PropTypes.func
  }

  static defaultProps = {
    dpi: 1.0
  }

  constructor (props) {
    super(props)

    // Determine initial map center, and what to display
    let mapCenter, zoom, markerLocation, label

    // If street has a location object, use its position and data
    if (props.street.location) {
      mapCenter = props.street.location.latlng
      zoom = MAP_LOCATION_ZOOM
      markerLocation = props.street.location.latlng
      label = props.street.location.label
    // If we've previously saved marker position, re-use that information
    } else if (props.markerLocation) {
      mapCenter = props.markerLocation
      zoom = MAP_LOCATION_ZOOM
      markerLocation = props.markerLocation
      label = props.addressInformation.label
    // If there's no prior location data, use the user's location, if available
    // In this case, display the map view, but no marker or popup
    } else if (props.userLocation) {
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

    this.state = {
      mapCenter: mapCenter,
      zoom: zoom,
      renderPopup: !!markerLocation,
      markerLocation: markerLocation,
      label: label,
      bbox: null,
      geocodeAvailable: !!(PELIAS_API_KEY)
    }
  }

  handleMapClick = (event) => {
    // Bail if geocoding is not available.
    if (!this.state.geocodeAvailable) return

    const latlng = {
      lat: event.latlng.lat,
      lng: event.latlng.lng
    }
    const zoom = event.target.getZoom()

    this.reverseGeocode(latlng)
      .then((res) => {
        const latlng = {
          lat: res.features[0].geometry.coordinates[1],
          lng: res.features[0].geometry.coordinates[0]
        }

        this.setState({
          mapCenter: latlng,
          zoom: zoom,
          renderPopup: true,
          markerLocation: latlng,
          label: res.features[0].properties.label,
          bbox: res.bbox || null
        })

        this.props.setMapState({
          markerLocation: latlng,
          addressInformation: res.features[0].properties
        })
      })
  }

  handleMarkerDragEnd = (event) => {
    const latlng = event.target.getLatLng()

    this.reverseGeocode(latlng)
      .then((res) => {
        this.setState({
          renderPopup: true,
          markerLocation: latlng,
          label: res.features[0].properties.label,
          bbox: res.bbox || null
        })

        this.props.setMapState({
          markerLocation: latlng,
          addressInformation: res.features[0].properties
        })
      })
  }

  handleMarkerDragStart = (event) => {
    this.setState({
      renderPopup: false
    })
  }

  handleConfirmLocation = (event) => {
    const { markerLocation, addressInformation } = this.props
    // const { bbox } = this.state
    // const point = [markerLocation.lng, markerLocation.lat]
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
      // geometryId: sharedstreets.geometryId([point]) || null,
      // intersectionId: sharedstreets.intersectionId(point) || null
    }

    // if (bbox) {
    //   const line = [bbox.slice(0, 2), bbox.slice(2, 4)]
    //   location.geometryId = sharedstreets.geometryId(line)
    // }

    trackEvent('Interaction', 'Geotag dialog: confirm chosen location', null, null, true)

    this.props.addLocation(location)
    this.props.saveStreetName(location.hierarchy.street, false)
    this.props.closeDialog()
  }

  handleClearLocation = (event) => {
    trackEvent('Interaction', 'Geotag dialog: cleared existing location', null, null, true)
    this.props.clearLocation()
    this.props.closeDialog()
  }

  reverseGeocode = (latlng) => {
    const url = `${REVERSE_GEOCODE_ENDPOINT}&point.lat=${latlng.lat}&point.lon=${latlng.lng}`

    return window.fetch(url)
      .then(response => response.json())
  }

  setSearchResults = (point, label, bbox) => {
    const latlng = {
      lat: point[0],
      lng: point[1]
    }

    this.setState({
      mapCenter: latlng,
      renderPopup: true,
      markerLocation: latlng,
      label: label,
      bbox: bbox || null
    })
  }

  /**
   * Determines if the street location can be saved or edited.
   */
  canEditLocation = () => {
    const { street } = this.props
    // The street is editable if either of the following conditions are true:
    //  - If there is no street owner
    //  - If there is a street owner, and it's equal to the current user
    //  - If there is no street location saved.
    return (!street.creatorId || !getRemixOnFirstEdit() || !street.location)
  }

  /**
   * Location can be cleared from a street that has a saved location, and
   * if that location is equal to the current marker position.
   * This does not check for street ownership. See `canEditLocation()` for that.
   */
  canClearLocation = () => {
    const { location } = this.props.street
    const { markerLocation } = this.state

    return location && (location.latlng.lat === markerLocation.lat && location.latlng.lng === markerLocation.lng)
  }

  render () {
    const tileUrl = (this.props.dpi > 1) ? MAP_TILES_2X : MAP_TILES

    return (
      <Dialog>
        {(closeDialog) => (
          <div className="geotag-dialog">
            {!this.state.geocodeAvailable && (
              <div className="geotag-error-banner">
                <FormattedMessage
                  id="dialogs.geotag.geotag-unavailable"
                  defaultMessage="Geocoding services are currently unavailable. You can view the map,
                    but you won’t be able to change this street’s location."
                />
              </div>
            )}
            {this.state.geocodeAvailable && (
              <div className="geotag-input-container">
                <GeoSearch setSearchResults={this.setSearchResults} focus={this.state.mapCenter} />
              </div>
            )}
            <Map
              center={this.state.mapCenter}
              zoomControl={false}
              zoom={this.state.zoom}
              onClick={this.handleMapClick}
            >
              <TileLayer
                attribution={MAP_ATTRIBUTION}
                url={tileUrl}
              />
              <ZoomControl
                zoomInTitle={this.props.intl.formatMessage({ id: 'dialogs.geotag.zoom-in', defaultMessage: 'Zoom in' })}
                zoomOutTitle={this.props.intl.formatMessage({ id: 'dialogs.geotag.zoom-out', defaultMessage: 'Zoom out' })}
              />

              {this.state.renderPopup &&
                <LocationPopup
                  position={this.state.markerLocation}
                  label={this.state.label}
                  isEditable={this.state.geocodeAvailable && this.canEditLocation()}
                  isClearable={this.state.geocodeAvailable && this.canClearLocation()}
                  handleConfirm={this.handleConfirmLocation}
                  handleClear={this.handleClearLocation}
                />
              }

              {this.state.markerLocation &&
                <Marker
                  position={this.state.markerLocation}
                  onDragEnd={this.handleMarkerDragEnd}
                  onDragStart={this.handleMarkerDragStart}
                  draggable={this.state.geocodeAvailable}
                />
              }
            </Map>
          </div>
        )}
      </Dialog>
    )
  }
}

// Inject Intl via a higher-order component provided by react-intl.
// Exported so that this component can be tested.
export const GeotagDialogWithIntl = injectIntl(GeotagDialog)

function mapStateToProps (state) {
  return {
    street: state.street,
    markerLocation: state.map.markerLocation,
    addressInformation: state.map.addressInformation,
    userLocation: state.user.geolocation.data,
    dpi: state.system.devicePixelRatio
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setMapState: (...args) => { dispatch(setMapState(...args)) },
    addLocation: (...args) => { dispatch(addLocation(...args)) },
    clearLocation: () => { dispatch(clearLocation()) },
    saveStreetName: (...args) => { dispatch(saveStreetName(...args)) },
    closeDialog: () => { dispatch(clearDialogs()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GeotagDialogWithIntl)
