import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { t } from '../app/locale'
import { trackEvent } from '../app/event_tracking'
import { SHOW_DIALOG } from '../store/actions'

export class StreetMetaGeotag extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    street: PropTypes.any,
    enableLocation: PropTypes.bool,
    showGeotagDialog: PropTypes.func
  }

  onClickGeotag = (event) => {
    event.preventDefault()
    if (!this.props.street.location) {
      trackEvent('Interaction', 'Clicked add location', null, null, true)
    } else {
      trackEvent('Interaction', 'Clicked existing location', null, null, true)
    }
    this.props.showGeotagDialog()
  }

  getGeotagText = () => {
    const { hierarchy } = this.props.street.location
    const unknownLabel = t('dialogs.geotag.unknown-location', 'Unknown location')
    let text = ''
    text = (hierarchy.locality) ? hierarchy.locality
      : (hierarchy.region) ? hierarchy.region
        : (hierarchy.neighbourhood) ? hierarchy.neighbourhood
          : unknownLabel
    if (text !== unknownLabel && hierarchy.country) {
      text = text + ', ' + hierarchy.country
    }
    return text
  }

  renderGeotag = (street, readOnly) => {
    const geotagText = (street.location) ? this.getGeotagText() : t('dialogs.geotag.add-location', 'Add location')
    const geolocation = (
      <span className="street-metadata-map">
        { (readOnly) ? geotagText : (
          <a onClick={this.onClickGeotag}> {geotagText} </a>
        ) }
      </span>
    )

    return (readOnly && !street.location) ? null : geolocation
  }

  render () {
    const geolocation = (this.props.enableLocation) ? this.renderGeotag(this.props.street, this.props.readOnly) : null

    return geolocation
  }
}

function mapStateToProps (state) {
  return {
    street: state.street,
    readOnly: state.app.readOnly,
    enableLocation: state.flags.GEOLOCATION.value
  }
}

function mapDispatchToProps (dispatch) {
  return {
    showGeotagDialog: () => {
      dispatch({
        type: SHOW_DIALOG,
        name: 'GEOTAG'
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StreetMetaGeotag)
