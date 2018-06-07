import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import { processWidthInput, prettifyWidth } from '../util/width_units'
import { getSegmentWidthResolution } from '../segments/resizing'
import { loseAnyFocus } from '../util/focus'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../users/constants'
import { updateUnits } from '../users/localization'
import { segmentsChanged } from '../segments/view'
import { createDomFromData } from './data_model'
import { resizeStreetWidth } from './width'
import { updateStreetWidth } from '../store/actions/street'

const STREET_WIDTH_CUSTOM = -1
const STREET_WIDTH_SWITCH_TO_METRIC = -2
const STREET_WIDTH_SWITCH_TO_IMPERIAL = -3

const MIN_CUSTOM_STREET_WIDTH = 10
export const MAX_CUSTOM_STREET_WIDTH = 400

const DEFAULT_STREET_WIDTHS = [40, 60, 80]

export class StreetMetaWidth extends React.Component {
  static propTypes = {
    intl: intlShape,
    readOnly: PropTypes.bool,
    street: PropTypes.object,
    updateStreetWidth: PropTypes.func
  }

  displayStreetWidthRemaining = () => {
    const width = prettifyWidth(Math.abs(this.props.street.remainingWidth), this.props.street.units)

    let differenceClass = ''
    let differenceEl = ''

    if (this.props.street.remainingWidth > 0) {
      differenceClass = 'street-width-under'
      differenceEl = <FormattedMessage id="width.under" defaultMessage="({width} room)" values={{ width }} />
    } else if (this.props.street.remainingWidth < 0) {
      differenceClass = 'street-width-over'
      differenceEl = <FormattedMessage id="width.over" defaultMessage="({width} over)" values={{ width }} />
    }

    return { class: differenceClass, width: differenceEl }
  }

  normalizeStreetWidth (width) {
    if (width < MIN_CUSTOM_STREET_WIDTH) {
      width = MIN_CUSTOM_STREET_WIDTH
    } else if (width > MAX_CUSTOM_STREET_WIDTH) {
      width = MAX_CUSTOM_STREET_WIDTH
    }

    var resolution = getSegmentWidthResolution()
    if (!resolution) {
      // TODO remove need to set a default here.
      resolution = 0.25
    }
    width = Math.round(width / resolution) * resolution

    return width
  }

  createStreetWidthOption = (width) => {
    return <option key={width} value={width}>{prettifyWidth(width, this.props.street.units)}</option>
  }

  renderStreetWidthMenu = () => {
    const formatMessage = this.props.intl.formatMessage

    var widths = []
    const defaultWidths = DEFAULT_STREET_WIDTHS.map((defaultWidth) => {
      let width = this.normalizeStreetWidth(defaultWidth)
      widths.push(width)
      return this.createStreetWidthOption(width)
    })

    let customWidthBlank = null
    let customWidth = null
    if (widths.indexOf(Number.parseFloat(this.props.street.width)) === -1) {
      customWidthBlank = <option disabled="true" />
      customWidth = this.createStreetWidthOption(this.props.street.width)
    }

    let selectedValue = ''
    if (this.props.street.width) {
      selectedValue = this.props.street.width
    }
    return (
      <select ref={(ref) => { this.streetWidth = ref }} onChange={this.changeStreetWidth} id="street-width" value={selectedValue}>
        <option disabled="true">
          {formatMessage({ id: 'width.occupied', defaultMessage: 'Occupied width:' })}
        </option>
        <option disabled="true">{prettifyWidth(this.props.street.occupiedWidth, this.props.street.units)}</option>
        <option disabled="true" />
        <option disabled="true">
          {formatMessage({ id: 'width.building', defaultMessage: 'Building-to-building width:' })}
        </option>
        {defaultWidths}
        {customWidthBlank}
        {customWidth}
        <option value={STREET_WIDTH_CUSTOM} >
          {formatMessage({ id: 'width.different', defaultMessage: 'Different width…' })}
        </option>
        <option disabled="true" />
        <option
          id="switch-to-imperial-units"
          value={STREET_WIDTH_SWITCH_TO_IMPERIAL}
          disabled={this.props.street.units === SETTINGS_UNITS_IMPERIAL}
        >
          {formatMessage({ id: 'width.imperial', defaultMessage: 'Switch to imperial units (feet)' })}
        </option>
        <option
          id="switch-to-metric-units"
          value={STREET_WIDTH_SWITCH_TO_METRIC}
          disabled={this.props.street.units === SETTINGS_UNITS_METRIC}
        >
          {formatMessage({ id: 'width.metric', defaultMessage: 'Switch to metric units' })}
        </option>
      </select>
    )
  }

  clickStreetWidth = (event) => {
    if (!this.props.readOnly) {
      document.body.classList.add('edit-street-width')

      this.streetWidth.focus()

      window.setTimeout(() => {
        var trigger = document.createEvent('MouseEvents')
        trigger.initEvent('mousedown', true, true, window)
        this.streetWidth.dispatchEvent(trigger)
      }, 0)
    }
  }

  changeStreetWidth = () => {
    if (this.props.readOnly) return

    let newStreetWidth = Number.parseInt(this.streetWidth.value, 10)

    document.body.classList.remove('edit-street-width')

    if (newStreetWidth === this.props.street.width) {
      return
    } else if (newStreetWidth === STREET_WIDTH_SWITCH_TO_METRIC) {
      updateUnits(SETTINGS_UNITS_METRIC)
      return
    } else if (newStreetWidth === STREET_WIDTH_SWITCH_TO_IMPERIAL) {
      updateUnits(SETTINGS_UNITS_IMPERIAL)
      return
    } else if (newStreetWidth === STREET_WIDTH_CUSTOM) {
      let promptValue = this.props.street.occupiedWidth
      if (promptValue < MIN_CUSTOM_STREET_WIDTH) promptValue = MIN_CUSTOM_STREET_WIDTH
      if (promptValue > MAX_CUSTOM_STREET_WIDTH) promptValue = MAX_CUSTOM_STREET_WIDTH

      const promptString = this.props.intl.formatMessage({
        id: 'prompt.new-width',
        defaultMessage: 'New street width (from {minWidth} to {maxWidth}):'
      }, {
        minWidth: prettifyWidth(MIN_CUSTOM_STREET_WIDTH, this.props.street.units),
        maxWidth: prettifyWidth(MAX_CUSTOM_STREET_WIDTH, this.props.street.units)
      })
      let width = window.prompt(promptString, prettifyWidth(promptValue, this.props.street.units))

      if (width) {
        width = this.normalizeStreetWidth(processWidthInput(width, this.props.street.units))
      }

      if (!width) {
        loseAnyFocus()
        return
      }

      if (width < MIN_CUSTOM_STREET_WIDTH) {
        width = MIN_CUSTOM_STREET_WIDTH
      } else if (width > MAX_CUSTOM_STREET_WIDTH) {
        width = MAX_CUSTOM_STREET_WIDTH
      }
      newStreetWidth = width
    }

    this.props.updateStreetWidth(this.normalizeStreetWidth(newStreetWidth))
    resizeStreetWidth()

    createDomFromData()
    segmentsChanged(false)

    loseAnyFocus()
  }

  render () {
    const width = prettifyWidth(this.props.street.width, this.props.street.units)
    const difference = this.displayStreetWidthRemaining()
    const differenceClass = `street-width-read-difference ${difference.class}`

    return (
      <span className="street-metadata-width">
        <span
          className="street-width-read"
          title={this.props.intl.formatMessage({id: 'tooltip.street-width', defaultMessage: 'Change width of the street'})}
          onClick={this.clickStreetWidth}
        >
          <span className="street-width-read-width">
            <FormattedMessage id="width.label" defaultMessage="{width} width" values={{ width }} />
          </span>
          &nbsp;
          <span className={differenceClass}>{difference.width}</span>
        </span>
        {this.renderStreetWidthMenu()}
      </span>
    )
  }
}

function mapStateToProps (state) {
  return {
    readOnly: state.app.readOnly,
    street: state.street
  }
}

function mapDispatchToProps (dispatch) {
  return {
    updateStreetWidth: (...args) => { dispatch(updateStreetWidth(...args)) }
  }
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(StreetMetaWidth))
