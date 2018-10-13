import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import { processWidthInput, prettifyWidth } from '../util/width_units'
import { loseAnyFocus } from '../util/focus'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../users/constants'
import { updateUnits } from '../users/localization'
import { segmentsChanged } from '../segments/view'
import { resizeStreetWidth } from './width'
import { updateStreetWidth } from '../store/actions/street'

const STREET_WIDTH_CUSTOM = -1
const STREET_WIDTH_SWITCH_TO_METRIC = -2
const STREET_WIDTH_SWITCH_TO_IMPERIAL = -3

const MIN_CUSTOM_STREET_WIDTH = 10
export const MAX_CUSTOM_STREET_WIDTH = 400

const DEFAULT_STREET_WIDTHS = [40, 60, 80]

class StreetMetaWidth extends React.Component {
  static propTypes = {
    intl: intlShape,
    editable: PropTypes.bool,
    street: PropTypes.object,
    updateStreetWidth: PropTypes.func,
    unitSettings: PropTypes.object
  }

  static defaultProps = {
    editable: true
  }

  constructor (props) {
    super(props)

    this.state = {
      isEditing: false
    }

    // Stores a ref to the street width <select> element
    this.streetWidth = React.createRef()
  }

  /**
   * If the `isEditing` state has toggled to true, focus the <select>
   */
  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.isEditing === true && prevState.isEditing === false) {
      this.streetWidth.current.focus()
    }
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
    const { unitSettings } = this.props

    if (width < MIN_CUSTOM_STREET_WIDTH) {
      width = MIN_CUSTOM_STREET_WIDTH
    } else if (width > MAX_CUSTOM_STREET_WIDTH) {
      width = MAX_CUSTOM_STREET_WIDTH
    }

    const resolution = (unitSettings && unitSettings.resolution)
    width = Math.round(width / resolution) * resolution

    return width
  }

  renderStreetWidthLabel = () => {
    const width = prettifyWidth(this.props.street.width, this.props.street.units)
    const difference = this.displayStreetWidthRemaining()
    const differenceClass = `street-width-read-difference ${difference.class}`

    // A title attribute is provided only when street width is editable
    const title = (this.props.editable)
      ? this.props.intl.formatMessage({
        id: 'tooltip.street-width',
        defaultMessage: 'Change width of the street'
      })
      : null

    // Apply a class when street width is editable to give it additional
    // editability styling
    let className = 'street-width'
    if (this.props.editable) {
      className += ' street-width-editable'
    }

    return (
      <span className={className} title={title} onClick={this.clickStreetWidth}>
        <FormattedMessage id="width.label" defaultMessage="{width} width" values={{ width }} />
        &nbsp;
        <span className={differenceClass}>{difference.width}</span>
      </span>
    )
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
      customWidthBlank = <option disabled />
      customWidth = this.createStreetWidthOption(this.props.street.width)
    }

    let selectedValue = ''
    if (this.props.street.width) {
      selectedValue = this.props.street.width
    }

    return (
      <select
        ref={this.streetWidth}
        onChange={this.changeStreetWidth}
        value={selectedValue}
        className="street-width-select"
        title={this.props.intl.formatMessage({
          id: 'tooltip.street-width',
          defaultMessage: 'Change width of the street'
        })}
      >
        <option disabled>
          {formatMessage({ id: 'width.occupied', defaultMessage: 'Occupied width:' })}
        </option>
        <option disabled>
          {prettifyWidth(this.props.street.occupiedWidth, this.props.street.units)}
        </option>
        <option disabled />
        <option disabled>
          {formatMessage({ id: 'width.building', defaultMessage: 'Building-to-building width:' })}
        </option>
        {defaultWidths}
        {customWidthBlank}
        {customWidth}
        <option value={STREET_WIDTH_CUSTOM} >
          {formatMessage({ id: 'width.different', defaultMessage: 'Different width…' })}
        </option>
        <option disabled />
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

  createStreetWidthOption = (width) => {
    return <option key={width} value={width}>{prettifyWidth(width, this.props.street.units)}</option>
  }

  /**
   * When the street width label is clicked, only allow editing if street
   * width is not read-only
   */
  clickStreetWidth = (event) => {
    if (this.props.editable) {
      this.setState({
        isEditing: true
      })
    }
  }

  changeStreetWidth = () => {
    this.setState({
      isEditing: false
    })

    let newStreetWidth = Number.parseInt(this.streetWidth.current.value, 10)

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

    segmentsChanged()

    loseAnyFocus()
  }

  render () {
    return (
      <span className="street-metadata-width">
        {
          (this.state.isEditing)
            ? this.renderStreetWidthMenu()
            : this.renderStreetWidthLabel()
        }
      </span>
    )
  }
}

export const StreetMetaWidthWithIntl = injectIntl(StreetMetaWidth)

function mapStateToProps (state) {
  return {
    street: state.street,
    unitSettings: state.ui.unitSettings,
    editable: !state.app.readOnly && state.flags.EDIT_STREET_WIDTH.value
  }
}

function mapDispatchToProps (dispatch) {
  return {
    updateStreetWidth: (...args) => { dispatch(updateStreetWidth(...args)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StreetMetaWidthWithIntl)
