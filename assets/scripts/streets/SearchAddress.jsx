import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Autosuggest from 'react-autosuggest'
import { throttle } from 'lodash'
import { apiurl, apikey } from './config'
import { setMapState } from '../store/actions/map'

class SearchAddress extends Component {
  static propTypes = {
    setMapState: PropTypes.func,
    setSearchResults: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      value: '',
      placeholder: 'Search for a location',
      suggestions: []
    }

    this.throttleMakeRequest = throttle(this.makeRequest, 250)
  }

  componentDidMount () {
    this.focusInput()
  }

  focusInput = () => {
    this.autosuggestBar.input.focus()
  }

  onChange = (event, inputValue) => {
    this.setState({
      value: inputValue.newValue
    })
  }

  onSuggestionsFetchRequested = (x) => {
    if (x.value.length >= 2) {
      const searchUrl = `${apiurl}?api_key=${apikey}&text=${x.value}`

      window.fetch(searchUrl)
        .then(response => response.json())
        .then(this.handleJSON)
    }
  }

  handleJSON = (response) => {
    if (response.features === undefined || response.features.length === 0) {
      this.setState({
        suggestions: []
      })
    }

    this.setState({
      suggestions: response.features
    })
  }

  onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    this.setState({
      coordReverse: suggestion.geometry.coordinates.reverse(),
      addressInfo: suggestion.properties,
      markerLocate: suggestion.geometry.coordinates,
      markerLabel: suggestion.properties.label
    })
  }

  clearSearch = () => {
    this.setState({
      value: ''
    })
    this.focusInput()
  }

  handleSubmit = (event) => {
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

  search = (query) => {
    const endpoint = `https://search.mapzen.com/v1/search?text=${query}&api_key=${apikey}`
    this.throttleMakeRequest(endpoint)
  }

  makeRequest = (endpoint) => {
    window.fetch(endpoint)
      .then(response => response.json())
      .then((results) => {
        this.setState({
          suggestions: results.features
        })
      })
  }

  getSuggestionValue (suggestion) {
    return suggestion.properties.label
  }

  renderSuggestion (suggestion) {
    return (
      <div className="geolocate-suggestion-item">
        {suggestion.properties.label}
      </div>
    )
  }

  renderClearButton = (value) => {
    if (value.length > 0) {
      return (
        <span title="Clear search" className="geolocate-input-clear" onClick={this.clearSearch}>×</span>
      )
    }
  }

  render () {
    const inputProps = {
      placeholder: this.state.placeholder,
      value: this.state.value,
      onChange: this.onChange
    }

    return (
      <form className="geolocate-input-form" onSubmit={this.handleSubmit}>
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
