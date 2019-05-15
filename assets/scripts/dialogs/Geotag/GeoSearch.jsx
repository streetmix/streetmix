import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import DownshiftPelias from 'downshift-pelias'
import Pelias from 'pelias-js'
import { injectIntl, intlShape } from 'react-intl'
import { PELIAS_HOST_NAME, PELIAS_API_KEY } from '../../app/config'
import { setMapState } from '../../store/actions/map'

class GeoSearch extends React.Component {
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
      initialQuery: ''
    }

    this.pelias = new Pelias({ peliasUrl: `https://${PELIAS_HOST_NAME}`, apiKey: PELIAS_API_KEY })
    this.inputEl = React.createRef()
  }

  onClickClearSearch = (clearSelection) => {
    clearSelection()
    this.inputEl.current.focus()
  }

  handleChange = (selection) => {
    if (!selection) return

    this.props.setMapState({
      addressInformation: selection.properties,
      markerLocation: {
        lat: selection.geometry.coordinates[1],
        lng: selection.geometry.coordinates[0]
      }
    })

    this.props.setSearchResults(selection.geometry.coordinates.reverse(), selection.properties.label, selection.bbox)
    this.inputEl.current.focus()
  }

  renderSuggestion = (item, index, downshift) => {
    const label = item.properties.label
    const { inputValue, getItemProps } = downshift

    // In order to handle changing the inputValue when highlighting an item, this.state.initialQuery is either null or
    // the initial query string before the user pressed the up/down arrow keys to go through the items. If null, the
    // query string to bold is equal to the inputValue given by downshift. Otherwise, it is equal to this.state.initialQuery.
    const query = this.state.initialQuery || inputValue

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
      <li {...getItemProps({
        className: 'geotag-suggestion',
        key: item.properties.gid,
        index,
        item
      })}>
        { highlighted }
      </li>
    )
  }

  stateReducer = (state, changes) => {
    switch (changes.type) {
      case '__autocomplete_keydown_arrow_up__':
      case '__autocomplete_keydown_arrow_down__':
        const highlightedItem = this.results && this.results.features && this.results.features[changes.highlightedIndex]

        if (!this.state.initialQuery) {
          this.setState({ initialQuery: state.inputValue })
        }

        return {
          ...changes,
          inputValue: (highlightedItem && highlightedItem.properties.label) || state.inputValue
        }
      default:
        return changes
    }
  }

  handleInputValueChange = () => { this.setState({ initialQuery: null }) }

  render () {
    const { focus } = this.props

    this.pelias.search.setBoundaryCircle({ lat: focus.lat, lon: focus.lng, radius: 10 })
    this.pelias.autocomplete.setFocusPoint({ lat: focus.lat, lon: focus.lng })

    return (
      <DownshiftPelias
        pelias={this.pelias}
        onChange={this.handleChange}
        stateReducer={this.stateReducer}
        handleInputValueChange={this.handleInputValueChange}
      >
        {({
          getInputProps,
          getMenuProps,
          getItemProps,
          clearSelection,
          inputValue,
          isOpen,
          results
        }) => {
          this.results = results

          return (
            <div className="geotag-input-form">
              <input {...getInputProps({
                className: 'geotag-input',
                autoFocus: true,
                ref: this.inputEl,
                placeholder: this.props.intl.formatMessage({ id: 'dialogs.geotag.search', defaultMessage: 'Search for a location' })
              })} />
              { inputValue && (
                <span
                  title={this.props.intl.formatMessage({ id: 'dialogs.geotag.clear-search', defaultMessage: 'Clear search' })}
                  className="geotag-input-clear"
                  onClick={() => { this.onClickClearSearch(clearSelection) }}
                >
                  ×
                </span>
              )}
              { isOpen && results && results.features.length > 0 && (
                <div className="geotag-suggestions-container">
                  <ul {...getMenuProps({ className: 'geotag-suggestions-list' })}>
                    { results.features.map((item, index) => {
                      const downshift = { inputValue, getItemProps }
                      return this.renderSuggestion(item, index, downshift)
                    })}
                  </ul>
                </div>
              )}
            </div>
          )
        }}
      </DownshiftPelias>
    )
  }
}

// Inject Intl via a higher-order component provided by react-intl.
// Exported so that this component can be tested.
export const GeoSearchWithIntl = injectIntl(GeoSearch)

function mapStateToProps (state) {
  return {
    markerLocation: state.map.markerLocation,
    addressInformation: state.map.addressInformation
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setMapState: (...args) => { dispatch(setMapState(...args)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GeoSearchWithIntl)
