import React from 'react'
import PropTypes from 'prop-types'
import { Popup } from 'react-leaflet'
import { FormattedMessage } from 'react-intl'

const POPUP_MAX_WIDTH = 300
const POPUP_OFFSET = [0, -30]

export default class LocationPopup extends React.Component {
  static propTypes = {
    position: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number
    }),
    label: PropTypes.string,
    isEditable: PropTypes.bool,
    isClearable: PropTypes.bool,
    handleConfirm: PropTypes.func,
    handleClear: PropTypes.func
  }

  static defaultProps = {
    isEditable: false,
    isClearable: false
  }

  renderLocationButton = () => {
    if (!this.props.isEditable) return null

    return (this.props.isClearable) ? (
      <div>
        <button className="geotag-location-button" onClick={this.props.handleClear}>
          <FormattedMessage id="dialogs.geotag.clear-location" defaultMessage="Clear location" />
        </button>
      </div>
    ) : (
      <div>
        <button className="geotag-location-button" onClick={this.props.handleConfirm}>
          <FormattedMessage id="dialogs.geotag.confirm-location" defaultMessage="Confirm location" />
        </button>
      </div>
    )
  }

  render () {
    if (!this.props.position) return null

    return (
      <Popup
        position={this.props.position}
        offset={POPUP_OFFSET}
        maxWidth={POPUP_MAX_WIDTH}
        closeButton={false}
        closeOnClick={false}
      >
        <div>{this.props.label}</div>
        {this.renderLocationButton()}
      </Popup>
    )
  }
}
