/* global L */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Map, TileLayer, ZoomControl, Marker, Popup } from 'react-leaflet'
import * as sharedstreets from 'sharedstreets'
import { PELIAS_HOST_NAME, PELIAS_API_KEY } from '../app/config'
import SearchAddress from '../streets/SearchAddress'
import { getRemixOnFirstEdit } from '../streets/remix'
import { setMapState } from '../store/actions/map'
import { addLocation, saveStreetName } from '../store/actions/street'
import { t } from '../app/locale'

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

class GeolocateDialog extends React.Component {
  static propTypes = {
    markerLocation: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.shape({
        lat: PropTypes.number,
        lng: PropTypes.number
      })
    ]),
    userLocation: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number
    }),
    addressInformation: PropTypes.object,
    addLocation: PropTypes.func,
    setMapState: PropTypes.func,
    addressInformationLabel: PropTypes.string,
    street: PropTypes.object,
    saveStreetName: PropTypes.func,
    closeDialog: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      // Default location if geo IP not detected; this hovers over Brooklyn
      mapCenter: [40.645, -73.975]
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
        mapCenter: [ userLocation.latitude, userLocation.longitude ]
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
    const latlng = {
      lat: location.latlng[0],
      lng: location.latlng[1]
    }

    this.reverseGeocode(latlng)
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
      markerLocation: res.features[0].geometry.coordinates.reverse()
    })

    this.setState({
      bbox: res.bbox || null,
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
    this.setState({
      addressName: label,
      mapCenter: point,
      markerLocation: point,
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
    const point = (typeof markerLocation.lng !== 'undefined') ? [markerLocation.lng, markerLocation.lat] : [markerLocation[1], markerLocation[0]]
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

  render () {
    const markers = this.props.markerLocation ? (
      <Marker
        position={this.props.markerLocation}
        onDragEnd={this.onDragEndMarker}
        onDragStart={this.hidePopup}
        draggable
      />
    ) : null

    const confirmButton = this.canEditLocation() ? (
      <button
        className="confirm-button"
        style={{marginTop: '10px'}}
        onClick={this.handleConfirm}
      >
        <b> Confirm Location </b>
      </button>
    ) : null

    let popup = this.props.markerLocation ? (
      <Popup
        position={this.props.markerLocation}
        maxWidth={300}
        closeOnClick={false}
        closeButton={false}
        offset={[0, -30]}
      >
        <span>
          {this.props.addressInformationLabel} <br />
          {confirmButton}
        </span>
      </Popup>
    ) : null

    if (this.state.renderPopup === false) {
      popup = null
    }

    const tileUrl = (window.devicePixelRatio > 1) ? MAP_TILES_2X : MAP_TILES

    return (
      <React.Fragment>
        <div className="geolocate-input-container">
          <SearchAddress setSearchResults={this.setSearchResults} />
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
            zoomInTitle={t('dialogs.geolocate.zoom-in', 'Zoom in')}
            zoomOutTitle={t('dialogs.geolocate.zoom-out', 'Zoom out')}
          />
          {popup}
          {markers}
        </Map>
      </React.Fragment>
    )
  }
}

function mapStateToProps (state) {
  return {
    markerLocation: state.map.markerLocation,
    addressInformationLabel: state.map.addressInformationLabel,
    addressInformation: state.map.addressInformation,
    userLocation: state.user.geolocation.data,
    street: state.street
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setMapState: (...args) => { dispatch(setMapState(...args)) },
    addLocation: (...args) => { dispatch(addLocation(...args)) },
    saveStreetName: (...args) => { dispatch(saveStreetName(...args)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GeolocateDialog)
