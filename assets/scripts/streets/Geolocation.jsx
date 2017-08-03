/* global fetch */
import React from 'react'
import { connect } from 'react-redux'
import { setSettings } from '../users/settings'
import PropTypes from 'prop-types'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import SearchAddress from './SearchAddress'
import {apiurlReverse, apikey} from './config'

const OpenStreetMapTiles = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OpenStreetMapAttr = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'

const zoomLevel = 12

class Geolocation extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      mapCenter: [40.645, -73.975]
    }

    this.searchResults = this.searchResults.bind(this)
    this.markerDrag = this.markerDrag.bind(this)
    this.gotClick = this.gotClick.bind(this)
    this.hidePopup = this.hidePopup.bind(this)
  }

/* start click event function */
  gotClick (e) {
    const displayAddressData = (res) => {
      setSettings({ addressInformationLabel: res.features[0].properties.label })
      setSettings({ markerLocation: res.features[0].geometry.coordinates.reverse() })

      this.map.leafletElement.panTo(this.props.markerLocation)
      console.log('Click Point Results : ', this.props.markerLocation, this.props.addressInformationLabel)
    }

    function gotAddressData (res, err) {
      res.json().then(displayAddressData)
    }

    const options = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    }

    const clickUrl = `${apiurlReverse}?api_key=${apikey}&point.lat=${options.lat}&point.lon=${options.lng}`
    fetch(clickUrl).then(gotAddressData)
  }

/* end click event function */

/* start on marker drag function */
  markerDrag (e) {
    const gotJson = (res) => {
      this.setState({
        renderPopup: true
      })

      setSettings({ addressInformationLabel: res.features[0].properties.label })
      setSettings({ markerLocation: e.target.getLatLng() })
      console.log('Drag End Results : ', e.target.getLatLng(), this.props.addressInformationLabel)
    }

    function gotAddress (res, err) {
      res.json().then(gotJson)
    }

    const targetCoords = e.target.getLatLng()

    const dragEndUrl = `${apiurlReverse}?api_key=${apikey}&point.lat=${targetCoords.lat}&point.lon=${targetCoords.lng}`
    fetch(dragEndUrl).then(gotAddress)
  }

/* end on marker drag function */

// p = point , l = label
  searchResults (p, l) {
    this.setState({
      addressName: l,
      mapCenter: p,
      markerLocation: p
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
      <div id='rootDiv'>
        <div id='dark-border'>
          <div id='input-box'>
            <SearchAddress searchResults={this.searchResults} />
          </div>
          <Map
            center={this.state.mapCenter}
            zoom={zoomLevel}
            onClick={this.gotClick}
            ref={(ref) => { this.map = ref }}
            >
            <TileLayer
              attribution={OpenStreetMapAttr}
              url={OpenStreetMapTiles}
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
  markerLocation: PropTypes.array
}

function mapStateToProps (state) {
  return {
    markerLocation: state.settings.markerLocation,
    addressInformationLabel: state.settings.addressInformationLabel
  }
}

export default connect(mapStateToProps)(Geolocation)
