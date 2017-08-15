import React from 'react'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import { setMapState } from '../store/actions/map'
import SearchAddress from './SearchAddress'
import { apiurlReverse, apikey } from './config'
import { clearDialogs, SHOW_DIALOG, store } from '../store/actions/dialogs'
import Dialog from '../dialogs/Dialog'

const OPEN_STREET_MAP_TILES = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
const OPEN_STREET_MAP_ATTR = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'

const zoomLevel = 12

class MapDialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      mapCenter: [40.645, -73.975]
    }

    this.setSearchResults = this.setSearchResults.bind(this)
    this.markerDrag = this.markerDrag.bind(this)
    this.onClick = this.onClick.bind(this)
    this.hidePopup = this.hidePopup.bind(this)
    this.unmountDialog = this.unmountDialog.bind(this)
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

  onClickMap () {
    store.dispatch({
      type: SHOW_DIALOG,
      name: 'MAP'
    })
  }

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

  setSearchResults (point, label) {
    this.setState({
      addressName: label,
      mapCenter: point,
      markerLocation: point
    })

    this.map.leafletElement.panTo(point)
  }

  hidePopup (e) {
    this.setState({
      renderPopup: false
    })
  }

  unmountDialog () {
    this.props.dispatch(clearDialogs())
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
        offset={[0, -30]}
      >
        <span>{this.props.addressInformationLabel}</span>
      </Popup>
    ) : null

    if (this.state.renderPopup === false) {
      popup = null
    }

    return (
      <Dialog className='map-dialog'>
        <div className='geolocation-input'>
          <SearchAddress setSearchResults={this.setSearchResults} />
        </div>
        <Map
          center={this.state.mapCenter}
          zoom={zoomLevel}
          onClick={this.onClick}
          ref={(ref) => { this.map = ref }}
          style={{height: '55vh'}}
        >
          <TileLayer
            attribution={OPEN_STREET_MAP_ATTR}
            url={OPEN_STREET_MAP_TILES}
          />
          {popup}
          {markers}
        </Map>
      </Dialog>
    )
  }
}

MapDialog.propTypes = {
  markerLocation: PropTypes.object,
  setMapState: PropTypes.func,
  addressInformationLabel: PropTypes.string,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps (state) {
  return {
    markerLocation: state.map.markerLocation,
    addressInformationLabel: state.map.addressInformationLabel
  }
}

function mapDispatchToProps (dispatch) {
  const boundActionCreators = bindActionCreators({ setMapState }, dispatch)
  return {...boundActionCreators, dispatch}
}

export default connect(mapStateToProps, mapDispatchToProps)(MapDialog)
