/* global L */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl, intlShape } from 'react-intl'
import { Map, TileLayer, ZoomControl, Marker, Popup } from 'react-leaflet'
import * as sharedstreets from 'sharedstreets'
import { PELIAS_HOST_NAME, PELIAS_API_KEY } from '../app/config'
import { trackEvent } from '../app/event_tracking'
import SearchAddress from '../streets/SearchAddress'
import { getRemixOnFirstEdit } from '../streets/remix'
import { setMapState } from '../store/actions/map'
import { addLocation, clearLocation, saveStreetName } from '../store/actions/street'

const REVERSE_GEOCODE_API = `https://${PELIAS_HOST_NAME}/v1/reverse`
const REVERSE_GEOCODE_ENDPOINT = `${REVERSE_GEOCODE_API}?api_key=${PELIAS_API_KEY}`
const MAP_TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
const MAP_TILES_2X = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
const MAP_INITIAL_ZOOM = 12

/* Override icon paths in stock Leaflet's stylesheet */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png'
})

export class GeotagDialog extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    markerLocation: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number
    }),
    userLocation: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number
    }),
    addressInformation: PropTypes.object,
    addLocation: PropTypes.func,
    clearLocation: PropTypes.func,
    setMapState: PropTypes.func,
    addressInformationLabel: PropTypes.string,
    street: PropTypes.object,
    saveStreetName: PropTypes.func,
    closeDialog: PropTypes.func,
    dpi: PropTypes.number
  }

  static defaultProps = {
    dpi: 1.0
  }

  constructor (props) {
    super(props)

    this.state = {
      bbox: null,
      renderPopup: !!props.markerLocation,
      // Default location if geo IP not detected; this hovers over Brooklyn
      mapCenter: {
        lat: 40.645,
        lng: -73.975
      }
    }
  }

  componentDidMount () {
    const { markerLocation, userLocation, street } = this.props

    const updateMarker = this.shouldUpdateMarker(street.location)
    if (updateMarker) {
      this.updateMapToStreetLocation(street.location)
    } else if (markerLocation) {
      this.setState({
        mapCenter: markerLocation
      })
    } else if (userLocation) {
      this.setState({
        mapCenter: {
          lat: userLocation.latitude,
          lng: userLocation.longitude
        }
      })
    }
  }

  // If there is a marker but no street, return false
  // If there is no marker but has a street, return true
  // If there is a marker and street, check
  // If there is no marker and no street, return false
  shouldUpdateMarker = (location) => {
    const { addressInformation } = this.props
    let updateMarkerToStreet = (!addressInformation && location)
    if (addressInformation && location) {
      // Checking if WOF ids match to see if need to update
      return (addressInformation.id !== location.wofId)
    }
    return updateMarkerToStreet
  }

  updateMapToStreetLocation = (location) => {
    this.reverseGeocode(location.latlng)
      .then(this.displayAddressData)
  }

  reverseGeocode = (latlng) => {
    const url = `${REVERSE_GEOCODE_ENDPOINT}&point.lat=${latlng.lat}&point.lon=${latlng.lng}`

    return window.fetch(url)
      .then(response => response.json())
  }

  displayAddressData = (res) => {
    this.props.setMapState({
      addressInformation: res.features[0].properties,
      addressInformationLabel: res.features[0].properties.label,
      markerLocation: {
        lat: res.features[0].geometry.coordinates[1],
        lng: res.features[0].geometry.coordinates[0]
      }
    })

    this.setState({
      bbox: res.bbox || null,
      renderPopup: true,
      mapCenter: this.props.markerLocation
    })
  }

  onClickMap = (event) => {
    const options = {
      lat: event.latlng.lat,
      lng: event.latlng.lng
    }

    this.reverseGeocode(options)
      .then(this.displayAddressData)
  }

  onDragEndMarker = (event) => {
    const latlng = event.target.getLatLng()
    const handleResponse = (res) => {
      this.setState({
        renderPopup: true,
        bbox: res.bbox || null
      })

      this.props.setMapState({
        addressInformation: res.features[0].properties,
        addressInformationLabel: res.features[0].properties.label,
        markerLocation: latlng
      })
    }

    this.reverseGeocode(latlng)
      .then(handleResponse)
  }

  setSearchResults = (point, label, bbox) => {
    const latlng = {
      lat: point[0],
      lng: point[1]
    }

    this.setState({
      addressName: label,
      mapCenter: latlng,
      markerLocation: latlng,
      bbox: bbox || null
    })
  }

  hidePopup = (e) => {
    this.setState({
      renderPopup: false
    })
  }

  handleConfirm = (e) => {
    const { markerLocation, addressInformation } = this.props
    const { bbox } = this.state
    const point = [markerLocation.lng, markerLocation.lat]
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
      geometryId: sharedstreets.geometryId([point]) || null,
      intersectionId: sharedstreets.intersectionId(point) || null
    }

    if (bbox) {
      const line = [bbox.slice(0, 2), bbox.slice(2, 4)]
      location.geometryId = sharedstreets.geometryId(line)
    }

    trackEvent('Interaction', 'Geotag dialog: confirm chosen location', null, null, true)
    this.props.addLocation(location)
    this.props.saveStreetName(location.hierarchy.street, false)
    this.props.closeDialog()
  }

  // If addressInformation does not have a street, return false
  // If there is no street owner, return true
  // If there is the street owner is equal to the current user, return true
  // If there is no street location, return true
  canEditLocation = () => {
    const { street, addressInformation } = this.props
    if (!addressInformation.street) return false
    return (!street.creatorId || !getRemixOnFirstEdit() || !street.location)
  }

  canClearLocation = () => {
    const { street, addressInformation } = this.props
    if (!street.location) return false
    return (street.location.wofId === addressInformation.id)
  }

  handleClear = (e) => {
    trackEvent('Interaction', 'Geotag dialog: cleared existing location', null, null, true)
    this.props.clearLocation()
    this.props.closeDialog()
  }

  renderLocationButton = () => {
    if (!this.canEditLocation()) return
    const isConfirmButton = (!this.canClearLocation())

    return (isConfirmButton) ? (
      <button className="geotag-location-button" onClick={this.handleConfirm}>
        {this.props.intl.formatMessage({ id: 'dialogs.geotag.confirm-location', defaultMessage: 'Confirm location' })}
      </button>
    ) : (
      <button className="geotag-location-button" onClick={this.handleClear}>
        {this.props.intl.formatMessage({ id: 'dialogs.geotag.clear-location', defaultMessage: 'Clear location' })}
      </button>
    )
  }

  render () {
    const tileUrl = (this.props.dpi > 1) ? MAP_TILES_2X : MAP_TILES

    return (
      <div className="geotag-dialog">
        <div className="geotag-input-container">
          <SearchAddress setSearchResults={this.setSearchResults} focus={this.state.mapCenter} />
        </div>
        <Map
          center={this.state.mapCenter}
          zoomControl={false}
          zoom={MAP_INITIAL_ZOOM}
          onClick={this.onClickMap}
          useFlyTo
          ref={(ref) => { this.map = ref }}
        >
          <TileLayer
            attribution={MAP_ATTRIBUTION}
            url={tileUrl}
          />
          <ZoomControl
            zoomInTitle={this.props.intl.formatMessage({ id: 'dialogs.geotag.zoom-in', defaultMessage: 'Zoom in' })}
            zoomOutTitle={this.props.intl.formatMessage({ id: 'dialogs.geotag.zoom-out', defaultMessage: 'Zoom out' })}
          />

          {(this.props.markerLocation && this.state.renderPopup) &&
            <Popup
              position={this.props.markerLocation}
              maxWidth={300}
              closeOnClick={false}
              closeButton={false}
              offset={[0, -30]}
            >
              <span>
                {this.props.addressInformationLabel} <br />
                {this.renderLocationButton()}
              </span>
            </Popup>
          }

          {this.props.markerLocation &&
            <Marker
              position={this.props.markerLocation}
              onDragEnd={this.onDragEndMarker}
              onDragStart={this.hidePopup}
              draggable
            />
          }
        </Map>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    markerLocation: state.map.markerLocation,
    addressInformationLabel: state.map.addressInformationLabel,
    addressInformation: state.map.addressInformation,
    userLocation: state.user.geolocation.data,
    street: state.street,
    dpi: state.system.devicePixelRatio
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setMapState: (...args) => { dispatch(setMapState(...args)) },
    addLocation: (...args) => { dispatch(addLocation(...args)) },
    clearLocation: () => { dispatch(clearLocation()) },
    saveStreetName: (...args) => { dispatch(saveStreetName(...args)) }
  }
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(GeotagDialog))
