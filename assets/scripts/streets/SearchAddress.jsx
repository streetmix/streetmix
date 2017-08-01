/* global fetch */
import React, { Component } from 'react'
import {apiurl, apikey} from './config'

class SearchAddress extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: ''
    }

    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleJSON = this.handleJSON.bind(this)
    this.searchAddress = this.searchAddress.bind(this)
  }

  handleKeyUp (e) {
    this.setState({
      value: e.target.value
    })
  }

  handleJSON (res, err) {
    if (res.features === undefined || res.features.length === 0) {
      return
    }

    this.props.searchResults(res.features[0].geometry.coordinates.reverse(), res.features[0].properties.label)

    this.setState({
      address: res.features[0].properties.label,
      loading: false,
      latlng: res.features[0].geometry.coordinates

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
    fetch(searchUrl).then(this.searchAddress)

    console.log('Component DID Update also fetched this url :', searchUrl)
  }

  render () {
    /* displays Loading */
    let loading

    if (this.state.loading === true) {
      loading = <i>loading</i>
    }

    return (

      <div>

        <input type='text' value={this.state.value} onChange={this.handleKeyUp} placeholder='Enter Address' />

        <p><b>{loading}</b></p>
      </div>

    )
  }
}

export default SearchAddress
