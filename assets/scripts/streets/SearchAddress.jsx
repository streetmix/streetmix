import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Autosuggest from 'react-autosuggest'
import { throttle } from 'lodash'
import { apiurl, apikey } from './config'
import { setMapState } from '../store/actions/map'

class SearchAddress extends Component {
  constructor (props) {
    super(props)

    this.state = {
      value: '',
      placeholder: 'Search for a location',
      suggestions: []
    }

    this.throttleMakeRequest = throttle(this.makeRequest, 250)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getSuggestionValue = this.getSuggestionValue.bind(this)
    this.onChange = this.onChange.bind(this)
    this.renderSuggestion = this.renderSuggestion.bind(this)
    this.renderClearButton = this.renderClearButton.bind(this)
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this)
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this)
    this.handleJSON = this.handleJSON.bind(this)
    this.clearSearch = this.clearSearch.bind(this)
    this.searchAddress = this.searchAddress.bind(this)
  }

  componentDidMount () {
    this.autosuggestBar.input.focus()
  }

  onSuggestionsFetchRequested (x) {
    if (x.value.length >= 2) {
      const searchUrl = `${apiurl}?api_key=${apikey}&text=${x.value}`
      window.fetch(searchUrl).then(this.searchAddress)
    }
  }

  onChange (event, inputValue) {
    this.setState({
      value: inputValue.newValue
    })
  }

  handleJSON (res, err) {
    this.setState({
      suggestions: res.features
    })
    if (res.features === undefined || res.features.length === 0) {
    }
  }

  onSuggestionSelected (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    this.setState({
      coordReverse: suggestion.geometry.coordinates.reverse(),
      addressInfo: suggestion.properties,
      markerLocate: suggestion.geometry.coordinates,
      markerLabel: suggestion.properties.label
    })
  }

  renderClearButton (value) {
    if (value.length > 2) {
      return (
        <span name='close' className='geolocation-input-clear' onClick={this.clearSearch}>×</span>
      )
    }
  }

  clearSearch () {
    this.setState({
      value: ''
    })
  }

  handleSubmit (event) {
    event.preventDefault()
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
      <form className='geolocation-input-form' onSubmit={this.handleSubmit}>
        <Autosuggest
          ref={(ref) => { this.autosuggestBar = ref }}
          suggestions={this.state.suggestions}
          onSuggestionSelected={this.onSuggestionSelected}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={() => {}}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          inputProps={inputProps}
        />
        {this.renderClearButton(this.state.value)}
      </form>
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
