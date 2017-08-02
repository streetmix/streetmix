/* global fetch */
import React from 'react'
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

  /* click event function */
  gotClick (e) {
    const displayAddressData = (res) => {
      const addressCoords = res.features[0].geometry.coordinates.reverse()
      const addressLabel = res.features[0].properties.label

      const position = {
        latlng: addressCoords
      }

      this.setState({
        addressName: addressLabel,
        markerLocation: position.latlng
      })

      this.map.leafletElement.panTo(addressCoords)
      console.log('Click Point Results : ', addressCoords, addressLabel)
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

/* on marker drag function */
  markerDrag (e) {
    const gotJson = (res) => {
      const addressLabel = res.features[0].properties.label

      this.setState({
        addressName: addressLabel,
        renderPopup: true,
        markerLocation: targetCoords
      })

      console.log('Drag End Results : ', e.target.getLatLng(), res.features[0].properties.label)
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
  }

  hidePopup (e) {
    this.setState({
      renderPopup: false
    })
  }

  render () {
    const markers = this.state.markerLocation ? (
      <Marker
        position={this.state.markerLocation}
        onDragEnd={this.markerDrag}
        onDragStart={this.hidePopup}
        draggable
      />
    ) : null

    let popup = this.state.markerLocation ? (
      <Popup
        position={this.state.markerLocation}
        maxWidth={300}
        closeOnClick={false}
        closeButton={false}
        offset={[0, -25]}
      >
        <span>{this.state.addressName}</span>
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

export default Geolocation
