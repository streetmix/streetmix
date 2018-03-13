import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { processWidthInput, prettifyWidth } from '../util/width_units'
import { getSegmentWidthResolution } from '../segments/resizing'
import { loseAnyFocus } from '../util/focus'
import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC,
  updateUnits
} from '../users/localization'
import { segmentsChanged } from '../segments/view'
import { createDomFromData } from './data_model'
import { resizeStreetWidth } from './width'
import { t } from '../app/locale'

import { updateStreetWidth } from '../store/actions/street'

const STREET_WIDTH_CUSTOM = -1
const STREET_WIDTH_SWITCH_TO_METRIC = -2
const STREET_WIDTH_SWITCH_TO_IMPERIAL = -3

const MIN_CUSTOM_STREET_WIDTH = 10
export const MAX_CUSTOM_STREET_WIDTH = 400

const DEFAULT_STREET_WIDTHS = [40, 60, 80]

class StreetWidth extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    street: PropTypes.object,
    updateStreetWidth: PropTypes.func
  }

  displayStreetWidthRemaining = () => {
    // TODO work on this so that we can use markup
    const width = prettifyWidth(Math.abs(this.props.street.remainingWidth), this.props.street.units)

    let differenceClass = ''
    let differenceString = ''

    if (this.props.street.remainingWidth > 0) {
      differenceClass = 'street-width-under'
      differenceString = t('width.room', '({{width}} room)', { width })
    } else if (this.props.street.remainingWidth < 0) {
      differenceClass = 'street-width-over'
      differenceString = t('width.over', '({{width}} over)', { width })
    }

    return { class: differenceClass, width: differenceString }
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
    var widths = []
    const defaultWidths = DEFAULT_STREET_WIDTHS.map((defaultWidth) => {
      let width = this.normalizeStreetWidth(defaultWidth)
      widths.push(width)
      return this.createStreetWidthOption(width)
    })

    let customWidthBlank = null
    let customWidth = null
    if (widths.indexOf(parseFloat(this.props.street.width)) === -1) {
      customWidthBlank = <option disabled="true" />
      customWidth = this.createStreetWidthOption(this.props.street.width)
    }

    let selectedValue = ''
    if (this.props.street.width) {
      selectedValue = this.props.street.width
    }
    return (
      <select ref={(ref) => { this.streetWidth = ref }} onChange={this.changeStreetWidth} id="street-width" value={selectedValue}>
        <option disabled="true">{t('width.occupied', 'Occupied width:')}</option>
        <option disabled="true">{prettifyWidth(this.props.street.occupiedWidth, this.props.street.units)}</option>
        <option disabled="true" />
        <option disabled="true">{t('width.building', 'Building-to-building width:')}</option>
        {defaultWidths}
        {customWidthBlank}
        {customWidth}
        <option value={STREET_WIDTH_CUSTOM} >
          {t('width.different', 'Different width…')}
        </option>
        <option disabled="true" />
        <option
          id="switch-to-imperial-units"
          value={STREET_WIDTH_SWITCH_TO_IMPERIAL}
          disabled={this.props.street.units === SETTINGS_UNITS_IMPERIAL}
        >
          {t('width.imperial', 'Switch to imperial units (feet)')}
        </option>
        <option
          id="switch-to-metric-units"
          value={STREET_WIDTH_SWITCH_TO_METRIC}
          disabled={this.props.street.units === SETTINGS_UNITS_METRIC}
        >
          {t('width.metric', 'Switch to metric units')}
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

    var newStreetWidth = parseInt(this.streetWidth.value)

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

      const replacements = {
        minWidth: prettifyWidth(MIN_CUSTOM_STREET_WIDTH, this.props.street.units),
        maxWidth: prettifyWidth(MAX_CUSTOM_STREET_WIDTH, this.props.street.units)
      }
      const promptString = t('prompt.new-width', 'New street width (from {{minWidth}} to {{maxWidth}}):', replacements)
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
    // TODO work on this so that we can use markup
    const width = prettifyWidth(this.props.street.width, this.props.street.units, { markup: false })
    const widthString = t('width.label', '{{width}} width', { width })
    const difference = this.displayStreetWidthRemaining()
    const differenceClass = `street-width-read-difference ${difference.class}`

    return (
      <span className="street-metadata-width">
        <span className="street-width-read" title="Change width of the street" onClick={this.clickStreetWidth}>
          <span className="street-width-read-width">{widthString}</span>
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
    street: state.street
  }
}

function mapDispatchToProps (dispatch) {
  return {
    updateStreetWidth: (...args) => { dispatch(updateStreetWidth(...args)) }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(StreetWidth)
