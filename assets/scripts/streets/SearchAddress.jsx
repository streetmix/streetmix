import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Autosuggest from 'react-autosuggest'
import { throttle } from 'lodash'
import { MAPZEN_API_KEY } from '../app/config'
import { setMapState } from '../store/actions/map'

const AUTOCOMPLETE_API = 'https://search.mapzen.com/v1/autocomplete'
const AUTOCOMPLETE_ENDPOINT = `${AUTOCOMPLETE_API}?api_key=${MAPZEN_API_KEY}`
const SEARCH_API = 'https://search.mapzen.com/v1/search'
const SEARCH_ENDPOINT = `${SEARCH_API}?api_key=${MAPZEN_API_KEY}`
const REQUEST_THROTTLE = 250
const MINIMUM_QUERY_LENGTH = 2

class SearchAddress extends Component {
  static propTypes = {
    setMapState: PropTypes.func,
    setSearchResults: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      value: '',
      suggestions: []
    }

    this.throttledMakeRequest = throttle(this.makeRequest, REQUEST_THROTTLE)
  }

  componentDidMount () {
    this.focusInput()
  }

  focusInput = () => {
    this.autosuggestBar.input.focus()
  }

  onClickClearSearch = () => {
    this.setState({
      value: '',
      suggestions: []
    })
    this.focusInput()
  }

  makeRequest = (endpoint) => {
    return window.fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.status)
        }

        return response.json()
      })
      .then((results) => {
        this.setState({
          suggestions: results.features
        })

        return results
      })
  }

  search = (query) => {
    const endpoint = `${SEARCH_ENDPOINT}&text=${query}`
    return this.throttledMakeRequest(endpoint)
  }

  autocomplete = (query) => {
    const endpoint = `${AUTOCOMPLETE_ENDPOINT}&text=${query}`
    return this.throttledMakeRequest(endpoint)
  }

  onSubmitInput = (event) => {
    event.preventDefault()
    const query = this.autosuggestBar.input.value.trim()
    if (query && query.length >= MINIMUM_QUERY_LENGTH) {
      this.search(query)
    }
  }

  onChangeInput = (event, { newValue, method }) => {
    this.setState({
      value: newValue
    })
  }

  onSuggestionsFetchRequested = ({ value }) => {
    const query = value.trim()
    if (query.length >= MINIMUM_QUERY_LENGTH) {
      this.autocomplete(value)
    }
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    })
  }

  onSuggestionSelected = (event, details) => {
    const { suggestion, suggestionValue } = details

    this.props.setMapState({
      addressInformationLabel: suggestionValue,
      addressInformation: suggestion.properties,
      markerLocation: suggestion.geometry.coordinates
    })
    this.props.setSearchResults(suggestion.geometry.coordinates.reverse(), suggestionValue)
  }

  shouldRenderSuggestions = (value) => {
    return value.trim().length > MINIMUM_QUERY_LENGTH
  }

  getSuggestionValue (suggestion) {
    return suggestion.properties.label
  }

  renderSuggestion (suggestion, { query }) {
    const label = suggestion.properties.label

    // Highlight the input query
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = label.split(regex)
    const highlighted = parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return <strong key={index}>{part}</strong>
      }
      return part
    })

    return (
      <div className="geolocate-suggestion-item">
        {highlighted}
      </div>
    )
  }

  renderClearButton = (value) => {
    if (value.length > 0) {
      return (
        <span title="Clear search" className="geolocate-input-clear" onClick={this.onClickClearSearch}>×</span>
      )
    }
  }

  render () {
    const inputProps = {
      placeholder: 'Search for a location',
      value: this.state.value,
      onChange: this.onChangeInput,
      spellCheck: false
    }

    return (
      <form className="geolocate-input-form" onSubmit={this.onSubmitInput}>
        <Autosuggest
          ref={(ref) => { this.autosuggestBar = ref }}
          suggestions={this.state.suggestions}
          onSuggestionSelected={this.onSuggestionSelected}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
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
