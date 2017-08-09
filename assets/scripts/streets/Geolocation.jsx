import React from 'react'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import { setMapState } from '../store/actions/map'
import SearchAddress from './SearchAddress'
import { apiurlReverse, apikey } from './config'

const OPEN_STREET_MAP_TILES = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
const OPEN_STREET_MAP_ATTR = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'

const zoomLevel = 12

class Geolocation extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      mapCenter: [40.645, -73.975]
    }

    this.searchResults = this.searchResults.bind(this)
    this.markerDrag = this.markerDrag.bind(this)
    this.onClick = this.onClick.bind(this)
    this.hidePopup = this.hidePopup.bind(this)
  }

  /* start click event function */
  onClick (e) {
    const displayAddressData = (res) => {
      this.props.setMapState({
        addressInformationLabel: res.features[0].properties.label,
        markerLocation: res.features[0].geometry.coordinates.reverse()

      })

      this.map.leafletElement.panTo(this.props.markerLocation)
    }

    function gotAddressData (res, err) {
      res.json().then(displayAddressData)
    }

    const options = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    }

    const clickUrl = `${apiurlReverse}?api_key=${apikey}&point.lat=${options.lat}&point.lon=${options.lng}`
    window.fetch(clickUrl).then(gotAddressData)
  }

  /* end click event function */

  /* start on marker drag function */
  markerDrag (e) {
    const gotJson = (res) => {
      this.setState({
        renderPopup: true
      })

      this.props.setMapState({
        addressInformationLabel: res.features[0].properties.label,
        markerLocation: e.target.getLatLng()

      })
    }

    function gotAddress (res, err) {
      res.json().then(gotJson)
    }

    const targetCoords = e.target.getLatLng()

    const dragEndUrl = `${apiurlReverse}?api_key=${apikey}&point.lat=${targetCoords.lat}&point.lon=${targetCoords.lng}`
    window.fetch(dragEndUrl).then(gotAddress)
  }

  /* end on marker drag function */

  searchResults (point, label) {
    this.setState({
      addressName: label,
      mapCenter: point,
      markerLocation: point
    })

    this.map.leafletElement.panTo(this.props.markerLocation)
  }

  hidePopup (e) {
    this.setState({
      renderPopup: false
    })
  }

  render () {
    const markers = this.props.markerLocation ? (
      <Marker
        position={this.props.markerLocation}
        onDragEnd={this.markerDrag}
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
        offset={[0, -25]}
      >
        <span>{this.props.addressInformationLabel}</span>
      </Popup>
    ) : null

    if (this.state.renderPopup === false) {
      popup = null
    }

    return (
      <div className='geolocation'>
        <div className='geolocation-border'>
          <div className='geolocation-input'>
            <SearchAddress searchResults={this.searchResults} />
          </div>
          <Map
            center={this.state.mapCenter}
            zoom={zoomLevel}
            onClick={this.onClick}
            ref={(ref) => { this.map = ref }}
          >
            <TileLayer
              attribution={OPEN_STREET_MAP_ATTR}
              url={OPEN_STREET_MAP_TILES}
            />
            {popup}
            {markers}
          </Map>
        </div>
      </div>
    )
  }
}

Geolocation.propTypes = {
  markerLocation: PropTypes.array,
  setMapState: PropTypes.object,
  addressInformationLabel: PropTypes.string
}

function mapStateToProps (state) {
  return {
    markerLocation: state.map.markerLocation,
    addressInformationLabel: state.map.addressInformationLabel
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ setMapState }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Geolocation)
