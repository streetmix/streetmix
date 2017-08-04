import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import { setMapState } from '../store/actions/map'
import { apiurl, apikey } from './config'

class SearchAddress extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: ''
    }

    this.onKeyUp = this.onKeyUp.bind(this)
    this.handleJSON = this.handleJSON.bind(this)
    this.searchAddress = this.searchAddress.bind(this)
  }

  onKeyUp (e) {
    this.setState({
      value: e.target.value
    })

    this.props.setMapState({ rawInputString: this.state.value })
  }

  handleJSON (res, err) {
    this.setState({
      loading: false
    })

    if (res.features === undefined || res.features.length === 0) {
      return
    }

    this.props.searchResults(res.features[0].geometry.coordinates.reverse(), this.props.addressInformationLabel)

    this.props.setMapState({
      addressInformationLabel: res.features[0].properties.label,
      addressInformation: res.features[0].properties,
      markerLocation: res.features[0].geometry.coordinates

    })
  }

  searchAddress (res, err) {
    res.json().then(this.handleJSON)
  }

  componentDidUpdate (prevProps, prevState) {
    const options = {
      api_key: apikey,
      text: this.state.value
    }

    if (prevState.value === this.state.value) {
      return false
    }

    this.setState({loading: true})

    const searchUrl = `${apiurl}?api_key=${options.api_key}&text=${options.text}`
    window.fetch(searchUrl).then(this.searchAddress)
  }

  render () {
    /* displays Loading */
    let loading

    if (this.state.loading === true) {
      loading = <i>loading</i>
    }

    return (

      <div>

        <input type='text' value={this.state.value} onChange={this.onKeyUp} placeholder='Enter Address' />

        <p><b>{loading}</b></p>
      </div>

    )
  }
}

SearchAddress.propTypes = {
  markerLocation: PropTypes.array
}

function mapStateToProps (state) {
  return {
    markerLocation: state.map.markerLocation,
    addressInformation: state.map.addressInformation,
    addressInformationLabel: state.map.addressInformationLabel
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ setMapState }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchAddress)
