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

    this.pelias = new Pelias({ peliasUrl: `https://${PELIAS_HOST_NAME}`, apiKey: PELIAS_API_KEY })
    this.inputEl = React.createRef()
  }

  render () {
    const { focus } = this.props

    this.pelias.search.setBoundaryCircle({ lat: focus.lat, lon: focus.lng, radius: 10 })
    this.pelias.autocomplete.setFocusPoint({ lat: focus.lat, lon: focus.lng })

    return (
      <DownshiftPelias pelias={this.pelias}>
        {({
          getInputProps,
          inputValue
        }) => (
          <div className="geotag-input-form">
            <input className="geotag-input" {...getInputProps({
              autoFocus: true,
              ref: this.inputEl,
              placeholder: this.props.intl.formatMessage({ id: 'dialogs.geotag.search', defaultMessage: 'Search for a location' })
            })} />
            { inputValue && (
              <span
                title={this.props.intl.formatMessage({ id: 'dialogs.geotag.clear-search', defaultMessage: 'Clear search' })}
                className="geotag-input-clear"
                onClick={this.onClickClearSearch}
              >
                ×
              </span>
            )}
          </div>
        )}
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
