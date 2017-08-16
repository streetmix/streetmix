import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Autosuggest from 'react-autosuggest'
import { throttle } from 'lodash'
import PropTypes from 'prop-types'
import { setMapState } from '../store/actions/map'
import { apiurl, apikey } from './config'

class SearchAddress extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: '',
      placeholder: 'Enter Address',
      suggestions: []
    }

    this.throttleMakeRequest = throttle(this.makeRequest, 250)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getSuggestionValue = this.getSuggestionValue.bind(this)
    this.onChange = this.onChange.bind(this)
    this.renderSuggestion = this.renderSuggestion.bind(this)
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this)
    this.handleJSON = this.handleJSON.bind(this)
    this.searchAddress = this.searchAddress.bind(this)
  }

  onSuggestionsFetchRequested (x) {
    if (x.value.length >= 2) {
      const searchUrl = `${apiurl}?api_key=${apikey}&text=${x.value}`
      window.fetch(searchUrl).then(this.searchAddress)
    }
  }

  onChange (e, x) {
    this.setState({
      value: x.newValue
    })
  }

  handleJSON (res, err) {
    this.setState({
      suggestions: res.features
    })
    if (res.features === undefined || res.features.length === 0) {
      return
    }

    this.setState({
      coordReverse: res.features[0].geometry.coordinates.reverse(),
      addressInfo: res.features[0].properties,
      markerLocate: res.features[0].geometry.coordinates,
      markerLabel: res.features[0].properties.label
    })
  }

  handleSubmit (e) {
    e.preventDefault()
    const inputValue = this.state.value
    if (inputValue !== '') {
      this.search(inputValue)
    }

    this.props.setMapState({
      addressInformationLabel: this.state.markerLabel,
      addressInformation: this.state.addresInfo,
      markerLocation: this.state.markerLocate
    })

    this.props.setSearchResults(this.state.coordReverse, this.state.markerLabel)
  }

  searchAddress (res, err) {
    res.json().then(this.handleJSON)
  }

  search (query) {
    const endpoint = `https://search.mapzen.com/v1/search?text=${query}&api_key=${apikey}`
    this.throttleMakeRequest(endpoint)
  }

  makeRequest (endpoint) {
    window.fetch(endpoint)
      .then(response => response.json())
      .then((results) => {
        this.setState({
          suggestions: results.features
        })
      })
  }

  renderSuggestion (suggestion) {
    return (
      <div className='map-search-suggestion-item'>
        {suggestion.properties.label}
      </div>
    )
  }

  getSuggestionValue (suggestion) {
    return suggestion.properties.label
  }

  render () {
    const inputProps = {
      placeholder: this.state.placeholder,
      value: this.state.value,
      onChange: this.onChange
    }
    return (
      <div>
        <form ref='searchBar' onSubmit={this.handleSubmit} className='inputContainer'>
          <Autosuggest
            ref={(ref) => { this.autosuggestBar = ref }}
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={() => {}}
            getSuggestionValue={this.getSuggestionValue}
            renderSuggestion={this.renderSuggestion}
            inputProps={inputProps}
          />
        </form>
      </div>

    )
  }
}

SearchAddress.propTypes = {
  setMapState: PropTypes.func,
  setSearchResults: PropTypes.func
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
