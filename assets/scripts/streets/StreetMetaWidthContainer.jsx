import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl, intlShape } from 'react-intl'
import StreetMetaWidthLabel from './StreetMetaWidthLabel'
import StreetMetaWidthMenu from './StreetMetaWidthMenu'

import {
  MIN_CUSTOM_STREET_WIDTH,
  MAX_CUSTOM_STREET_WIDTH,
  STREET_WIDTH_CUSTOM,
  STREET_WIDTH_SWITCH_TO_METRIC,
  STREET_WIDTH_SWITCH_TO_IMPERIAL
} from './constants'

import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../users/constants'
import { updateUnits } from '../users/localization'
import { normalizeStreetWidth } from './width'
import { processWidthInput, prettifyWidth } from '../util/width_units'
import { updateStreetWidthAction as updateStreetWidth } from '../store/actions/street'

class StreetMetaWidthContainer extends Component {
  static propTypes = {
    // from react-intl
    intl: intlShape.isRequired,

    // from Redux mapStateToProps
    editable: PropTypes.bool,
    street: PropTypes.object.isRequired,

    // from Redux mapDispatchToProps
    updateStreetWidth: PropTypes.func.isRequired
  }

  static defaultProps = {
    editable: true
  }

  constructor (props) {
    super(props)

    this.state = {
      isEditing: false
    }
  }

  /**
   * When the street width label is clicked, only allow editing if street
   * width is not read-only
   */
  handleClickLabel = (event) => {
    if (this.props.editable) {
      this.setState({
        isEditing: true
      })
    }
  }

  /**
   * Handles changes to the <select> dropdown rendered in <StreetMetaWidthMenu />
   *
   * @param {string} - value from selected <option>
   */
  handleChangeMenuSelection = (value) => {
    this.setState({
      isEditing: false
    })

    const { units, width, occupiedWidth } = this.props.street
    const selection = Number.parseInt(value, 10)

    switch (selection) {
      case STREET_WIDTH_SWITCH_TO_METRIC:
        updateUnits(SETTINGS_UNITS_METRIC)
        break
      case STREET_WIDTH_SWITCH_TO_IMPERIAL:
        updateUnits(SETTINGS_UNITS_IMPERIAL)
        break
      // Prompt for new street width
      case STREET_WIDTH_CUSTOM: {
        const promptValue = normalizeStreetWidth(occupiedWidth, units)
        const promptString = this.props.intl.formatMessage({
          id: 'prompt.new-width',
          defaultMessage: 'New street width (from {minWidth} to {maxWidth}):'
        }, {
          minWidth: prettifyWidth(MIN_CUSTOM_STREET_WIDTH, units),
          maxWidth: prettifyWidth(MAX_CUSTOM_STREET_WIDTH, units)
        })
        const inputWidth = window.prompt(promptString, prettifyWidth(promptValue, units))

        if (inputWidth) {
          const newWidth = normalizeStreetWidth(processWidthInput(inputWidth, units), units)
          this.props.updateStreetWidth(newWidth)
        }

        break
      }
      // Do nothing if the selection is the original width
      case width:
        break
      // Change width to the desired selection
      default:
        if (selection) {
          this.props.updateStreetWidth(selection)
        }
        break
    }
  }

  render () {
    return (
      <span className="street-metadata-width">
        {
          (this.state.isEditing)
            ? (
              <StreetMetaWidthMenu
                street={this.props.street}
                onChange={this.handleChangeMenuSelection}
                formatMessage={this.props.intl.formatMessage}
              />
            )
            : (
              <StreetMetaWidthLabel
                street={this.props.street}
                editable={this.props.editable}
                onClick={this.handleClickLabel}
                formatMessage={this.props.intl.formatMessage}
              />
            )
        }
      </span>
    )
  }
}

export const StreetMetaWidthContainerWithIntl = injectIntl(StreetMetaWidthContainer)

function mapStateToProps (state) {
  return {
    street: state.street,
    editable: !state.app.readOnly && state.flags.EDIT_STREET_WIDTH.value
  }
}

const mapDispatchToProps = {
  updateStreetWidth
}

export default connect(mapStateToProps, mapDispatchToProps)(StreetMetaWidthContainerWithIntl)
