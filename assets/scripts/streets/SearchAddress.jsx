import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl, intlShape } from 'react-intl'
import Autosuggest from 'react-autosuggest'
import { throttle } from 'lodash'
import { PELIAS_HOST_NAME, PELIAS_API_KEY } from '../app/config'
import { setMapState } from '../store/actions/map'

const AUTOCOMPLETE_API = `https://${PELIAS_HOST_NAME}/v1/autocomplete`
const AUTOCOMPLETE_ENDPOINT = `${AUTOCOMPLETE_API}?api_key=${PELIAS_API_KEY}`
const SEARCH_API = `https://${PELIAS_HOST_NAME}/v1/search`
const SEARCH_ENDPOINT = `${SEARCH_API}?api_key=${PELIAS_API_KEY}`
const REQUEST_THROTTLE = 300
const MINIMUM_QUERY_LENGTH = 3

export class SearchAddress extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    setMapState: PropTypes.func,
    setSearchResults: PropTypes.func,
    focus: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number
    }).isRequired
  }

  static defaultProps = {
    focus: { lat: 0, lng: 0 }
  }

  constructor (props) {
    super(props)

    this.state = {
      value: '',
      suggestions: []
    }

    // Timestamp of the last response which was successfully rendered to the UI.
    // The time represents when the request was *sent*, not when it was received.
    this.requestRenderedTimestamp = new Date().getTime()
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
    // Track when this request began
    const requestStartedAt = new Date().getTime()

    return window.fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.status)
        }

        return response.json()
      })
      .then((results) => {
        // Throw away stale results if they are returned out of order.
        if (this.requestRenderedTimestamp >= requestStartedAt) {
          return
        }

        this.setState({
          suggestions: results.features
        })

        // Record the timestamp of the request.
        this.requestRenderedTimestamp = requestStartedAt

        return results
      })
  }

  throttledMakeRequest = throttle(this.makeRequest, REQUEST_THROTTLE)

  search = (query, focus) => {
    const url = `${SEARCH_ENDPOINT}&text=${query}&focus.point.lat=${focus.lat}&focus.point.lon=${focus.lng}`
    return this.throttledMakeRequest(url)
  }

  autocomplete = (query, focus) => {
    const url = `${AUTOCOMPLETE_ENDPOINT}&text=${query}&focus.point.lat=${focus.lat}&focus.point.lon=${focus.lng}`
    return this.throttledMakeRequest(url)
  }

  onSubmitInput = (event) => {
    event.preventDefault()
    const query = this.state.value.trim()
    if (query && query.length >= MINIMUM_QUERY_LENGTH) {
      this.search(query, this.props.focus)
    }
  }

  onChangeInput = (event, { newValue, method }) => {
    this.setState({
      value: newValue
    })

    // Clears list if input is empty, currently needed because of the bug
    // that requires `alwaysRenderSuggestions = true` and `onSuggestionsClearRequested`
    // is a no-op
    if (!newValue) {
      this.setState({
        suggestions: []
      })
    }
  }

  onSuggestionsFetchRequested = ({ value, reason }) => {
    const query = value.trim()

    // Prevent suggestion selection or input focus from sending a new request
    if (reason === 'suggestion-selected' || reason === 'input-focused') return

    if (query.length >= MINIMUM_QUERY_LENGTH) {
      this.autocomplete(value, this.props.focus)
    }
  }

  // TODO: there is a bug where clearing suggestions here will swallow
  // click event, preventing them from ever firing. This is commented out
  // until this is fixed.
  onSuggestionsClearRequested = () => {
    // this.setState({
    //   suggestions: []
    // })
  }

  onSuggestionSelected = (event, details) => {
    const { suggestion, suggestionValue, method } = details

    // Prevent 'enter' keydown on suggestion list from submitting the form.
    if (method === 'enter') {
      event.preventDefault()
    }

    // This takes the place of `onSuggestionsClearRequested` for now,
    // clearing the suggestions only after the click event has registered.
    this.setState({
      suggestions: []
    })

    this.props.setMapState({
      addressInformationLabel: suggestionValue,
      addressInformation: suggestion.properties,
      markerLocation: {
        lat: suggestion.geometry.coordinates[1],
        lng: suggestion.geometry.coordinates[0]
      }
    })
    this.props.setSearchResults(suggestion.geometry.coordinates.reverse(), suggestionValue, suggestion.bbox)
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
      <div className="geotag-suggestion-item">
        {highlighted}
      </div>
    )
  }

  renderClearButton = (value) => {
    if (!value || value.length === 0) return null

    return (
      <span
        title={this.props.intl.formatMessage({ id: 'dialogs.geotag.clear-search', defaultMessage: 'Clear search' })}
        className="geotag-input-clear"
        onClick={this.onClickClearSearch}
      >
        ×
      </span>
    )
  }

  render () {
    const inputProps = {
      placeholder: this.props.intl.formatMessage({ id: 'dialogs.geotag.search', defaultMessage: 'Search for a location' }),
      value: this.state.value,
      onChange: this.onChangeInput,
      spellCheck: false
    }

    // Note: `alwaysRenderSuggestions` is required to be true otherwise
    // click events on the item list is swallowed. This is a bug
    return (
      <form className="geotag-input-form" onSubmit={this.onSubmitInput} dir="auto">
        <Autosuggest
          ref={(ref) => { this.autosuggestBar = ref }}
          suggestions={this.state.suggestions}
          alwaysRenderSuggestions
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
  return {
    setMapState: (...args) => { dispatch(setMapState(...args)) }
  }
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SearchAddress))
