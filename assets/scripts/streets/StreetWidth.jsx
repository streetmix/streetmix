import React from 'react'
import { processWidthInput, prettifyWidth } from '../util/width_units'
import { getSegmentWidthResolution } from '../segments/resizing'
import { loseAnyFocus } from '../app/focus'
import { setInitializing } from '../app/initialization'
import { msg } from '../app/messages'
import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC,
  updateUnits
} from '../users/localization'
import { segmentsChanged } from '../segments/view'
import { setAndSaveStreet, createDomFromData } from './data_model'
import { resizeStreetWidth } from './width'

const STREET_WIDTH_CUSTOM = -1
const STREET_WIDTH_SWITCH_TO_METRIC = -2
const STREET_WIDTH_SWITCH_TO_IMPERIAL = -3

const MIN_CUSTOM_STREET_WIDTH = 10
export const MAX_CUSTOM_STREET_WIDTH = 400

const DEFAULT_STREET_WIDTHS = [40, 60, 80]

export default class StreetWidth extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      street: this.props.street
    }
    this.displayStreetWidthRemaining = this.displayStreetWidthRemaining.bind(this)
    this.normalizeStreetWidth = this.normalizeStreetWidth.bind(this)
    this.createStreetWidthOption = this.createStreetWidthOption.bind(this)
    this.renderStreetWidthMenu = this.renderStreetWidthMenu.bind(this)
    this.clickStreetWidth = this.clickStreetWidth.bind(this)
    this.changeStreetWidth = this.changeStreetWidth.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      street: nextProps.street
    })
  }

  displayStreetWidthRemaining () {
    // TODO work on this so that we can use markup
    const width = prettifyWidth(Math.abs(this.state.street.remainingWidth), {markup: false})

    let differenceClass = ''
    let widthDifference = ''
    if (this.state.street.remainingWidth > 0) {
      differenceClass = 'street-width-under'
      widthDifference = '(' + width + ' room)'
    } else if (this.state.street.remainingWidth < 0) {
      differenceClass = 'street-width-over'
      widthDifference = '(' + width + ' over)'
    }
    return {class: differenceClass, width: widthDifference}
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

  createStreetWidthOption (width) {
    return <option key={width}>{prettifyWidth(width)}</option>
  }

  renderStreetWidthMenu () {
    var widths = []
    const defaultWidths = DEFAULT_STREET_WIDTHS.map((default_width) => {
      let width = this.normalizeStreetWidth(default_width)
      widths.push(width)
      return this.createStreetWidthOption(width)
    })

    let customWidthBlank = null
    let customWidth = null
    if (widths.indexOf(parseFloat(this.state.street.width))) {
      customWidthBlank = <option disabled="true"/>
      customWidth = this.createStreetWidthOption(this.state.street.width)
    }

    let selectedValue = ''
    if (this.state.street.width) {
      selectedValue = this.state.street.width
    }
    return <select ref={(ref) => { this.streetWidth = ref }} onChange={this.changeStreetWidth} id='street-width' value={selectedValue}>
      <option disabled="true">Occupied width:</option>
      <option disabled="true">{prettifyWidth(this.state.street.occupiedWidth)}</option>
      <option disabled="true"/>
      <option disabled="true">Building-to-building width:</option>
      {defaultWidths}
      {customWidthBlank}
      {customWidth}
      <option value={STREET_WIDTH_CUSTOM} >
        Different width…
      </option>
      <option disabled="true"/>
      <option
        id="switch-to-imperial-units"
        value={STREET_WIDTH_SWITCH_TO_IMPERIAL}
        disabled={this.state.street.units === SETTINGS_UNITS_IMPERIAL}
      >
        {msg('MENU_SWITCH_TO_IMPERIAL')}
      </option>
      <option
        id="switch-to-metric-units"
        value={STREET_WIDTH_SWITCH_TO_METRIC}
        disabled={this.state.street.units === SETTINGS_UNITS_METRIC}
      >
        {msg('MENU_SWITCH_TO_METRIC')}
      </option>
    </select>
  }

  clickStreetWidth (e) {
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

  changeStreetWidth () {
    debugger
    if (!this.props.readOnly) {
      var newStreetWidth = parseInt(this.streetWidth.value)

      document.body.classList.remove('edit-street-width')

      if (newStreetWidth === this.state.street.width) {
        return
      } else if (newStreetWidth === STREET_WIDTH_SWITCH_TO_METRIC) {
        updateUnits(SETTINGS_UNITS_METRIC)
        return
      } else if (newStreetWidth === STREET_WIDTH_SWITCH_TO_IMPERIAL) {
        updateUnits(SETTINGS_UNITS_IMPERIAL)
        return
      } else if (newStreetWidth === STREET_WIDTH_CUSTOM) {
        var promptValue = this.state.street.occupiedWidth
        if (promptValue < MIN_CUSTOM_STREET_WIDTH) promptValue = MIN_CUSTOM_STREET_WIDTH
        if (promptValue > MAX_CUSTOM_STREET_WIDTH) promptValue = MAX_CUSTOM_STREET_WIDTH

        // TODO string
        var width = window.prompt(
          msg('PROMPT_NEW_STREET_WIDTH', {
            minWidth: prettifyWidth(MIN_CUSTOM_STREET_WIDTH),
            maxWidth: prettifyWidth(MAX_CUSTOM_STREET_WIDTH)
          }), prettifyWidth(promptValue))

        if (width) {
          width = this.normalizeStreetWidth(processWidthInput(width))
        }

        if (!width) {
          // buildStreetWidthMenu()

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

      // TODO figure out what to do with street here

      const street = Object.assign({}, this.state.street)
      street.width = this.normalizeStreetWidth(newStreetWidth)
      setAndSaveStreet(street)

      // TODO clean up the rest of this function
      resizeStreetWidth()

      setInitializing(true)

      createDomFromData()
      segmentsChanged()

      setInitializing(false)

      loseAnyFocus()
    }
  }

  render()
  {
    // TODO prettifyWidth calls getStreet(). refactor this to use units passed by argument instead
    // TODO work on this so that we can use markup
    const width = prettifyWidth(this.state.street.width, {markup: false}) + ' width'
    const difference = this.displayStreetWidthRemaining()

    return (
      <span id='street-metadata-width'>
        <span id='street-width-read' title='Change width of the street' onClick={this.clickStreetWidth}>
          <span id='street-width-read-width'>{width}</span>
          &nbsp;
          <span id='street-width-read-difference' className={difference.class}>{difference.width}</span>
        </span>
        {this.renderStreetWidthMenu()}
      </span>
    )
  }
}

StreetWidth.propTypes = {
  readOnly: React.PropTypes.bool,
  street: React.PropTypes.any
}

