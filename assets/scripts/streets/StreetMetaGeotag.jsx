import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { trackEvent } from '../app/event_tracking'
import { showDialog } from '../store/actions/dialogs'

export class StreetMetaGeotag extends React.Component {
  static propTypes = {
    editable: PropTypes.bool,
    street: PropTypes.any,
    showDialog: PropTypes.func
  }

  static defaultProps = {
    editable: true
  }

  onClickGeotag = (event) => {
    event.preventDefault()

    if (!this.props.street.location) {
      trackEvent('Interaction', 'Clicked add location', null, null, true)
    } else {
      trackEvent('Interaction', 'Clicked existing location', null, null, true)
    }

    this.props.showDialog('GEOTAG')
  }

  getGeotagText = () => {
    const { hierarchy } = this.props.street.location
    const unknownLabel = <FormattedMessage id="dialogs.geotag.unknown-location" defaultMessage="Unknown location" />

    let text = (hierarchy.locality) ? hierarchy.locality
      : (hierarchy.region) ? hierarchy.region
        : (hierarchy.neighbourhood) ? hierarchy.neighbourhood
          : null

    if (text && hierarchy.country) {
      text = text + ', ' + hierarchy.country
    }

    return text || unknownLabel
  }

  render () {
    // Render nothing if there is no street location, and geolocation is not enabled
    if (!this.props.editable && !this.props.street.location) return null

    // Determine what text label to render
    const geotagText = (this.props.street.location)
      ? this.getGeotagText()
      : <FormattedMessage id="dialogs.geotag.add-location" defaultMessage="Add location" />

    return (
      <span className="street-metadata-map">
        {(this.props.editable)
          ? <a onClick={this.onClickGeotag}>{geotagText}</a>
          : geotagText}
      </span>
    )
  }
}

function mapStateToProps (state) {
  return {
    street: state.street,
    editable: !state.app.readOnly && state.flags.GEOTAG.value
  }
}

const mapDispatchToProps = {
  showDialog
}

export default connect(mapStateToProps, mapDispatchToProps)(StreetMetaGeotag)
