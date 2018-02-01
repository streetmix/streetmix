/* global L */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Map, TileLayer, ZoomControl, Marker, Popup } from 'react-leaflet'
import { PELIAS_HOST_NAME, PELIAS_API_KEY } from '../app/config'
import Dialog from './Dialog'
import SearchAddress from '../streets/SearchAddress'
import { getStreet, saveStreetToServerIfNecessary } from '../streets/data_model'
import { updateStreetName } from '../streets/name'
import { setMapState } from '../store/actions/map'
import { addLocation, saveStreetName } from '../store/actions/street'
import { t } from '../app/locale'

const REVERSE_GEOCODE_API = `https://${PELIAS_HOST_NAME}/v1/reverse`
const REVERSE_GEOCODE_ENDPOINT = `${REVERSE_GEOCODE_API}?api_key=${PELIAS_API_KEY}`
const MAP_TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
const MAP_TILES_2X = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'

const zoomLevel = 12

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
    userUpdate: PropTypes.bool,
    saveStreetName: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      // Default location if geo IP not detected; this hovers over Brooklyn
      mapCenter: [40.645, -73.975]
    }
  }

  componentDidMount () {
    const { markerLocation, userLocation } = this.props

    if (markerLocation) {
      this.map.leafletElement.panTo(markerLocation)
    } else if (userLocation) {
      this.map.leafletElement.panTo([ userLocation.latitude, userLocation.longitude ])
    }
  }

  reverseGeocode = (latlng) => {
    const url = `${REVERSE_GEOCODE_ENDPOINT}&point.lat=${latlng.lat}&point.lon=${latlng.lng}`

    return window.fetch(url)
      .then(response => response.json())
  }

  onClickMap = (event) => {
    const options = {
      lat: event.latlng.lat,
      lng: event.latlng.lng
    }

    const displayAddressData = (res) => {
      this.props.setMapState({
        addressInformation: res.features[0].properties,
        addressInformationLabel: res.features[0].properties.label,
        markerLocation: res.features[0].geometry.coordinates.reverse()
      })

      this.map.leafletElement.panTo(this.props.markerLocation)
    }

    this.reverseGeocode(options)
      .then(displayAddressData)
  }

  onDragEndMarker = (event) => {
    const latlng = event.target.getLatLng()
    const handleResponse = (res) => {
      this.setState({
        renderPopup: true
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

  setSearchResults = (point, label) => {
    this.setState({
      addressName: label,
      mapCenter: point,
      markerLocation: point
    })

    this.map.leafletElement.panTo(point)
  }

  hidePopup = (e) => {
    this.setState({
      renderPopup: false
    })
  }

  handleConfirm = (e) => {
    const { markerLocation, addressInformation, userUpdate } = this.props

    const location = {
      latlng: markerLocation, // array of location
      label: addressInformation.label,
      hierarchy: {
        country: addressInformation.country,
        locality: addressInformation.locality,
        neighbourhood: addressInformation.neighbourhood,
        street: addressInformation.street
      }
    }

    // Location added to global street variable in action creator
    this.props.addLocation(location)
    if (!userUpdate) {
      this.props.saveStreetName(location.hierarchy.street, false)
      // Update street name of global street variable here
      const street = getStreet()
      street.name = location.hierarchy.street
      saveStreetToServerIfNecessary()
      updateStreetName()
    }
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
          <button
            className="confirm-button"
            style={{marginTop: '10px'}}
            onClick={this.handleConfirm}
          >
            <b> Confirm Location </b>
          </button>
        </span>
      </Popup>
    ) : null

    if (this.state.renderPopup === false) {
      popup = null
    }

    const tileUrl = (window.devicePixelRatio > 1) ? MAP_TILES_2X : MAP_TILES

    return (
      <Dialog className="geolocate-dialog">
        <div className="geolocate-input-container">
          <SearchAddress setSearchResults={this.setSearchResults} />
        </div>
        <Map
          center={this.state.mapCenter}
          zoomControl={false}
          zoom={zoomLevel}
          onClick={this.onClickMap}
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
      </Dialog>
    )
  }
}

function mapStateToProps (state) {
  return {
    markerLocation: state.map.markerLocation,
    addressInformationLabel: state.map.addressInformationLabel,
    addressInformation: state.map.addressInformation,
    userLocation: state.user.geolocation.data,
    userUpdate: state.street.userUpdate
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
