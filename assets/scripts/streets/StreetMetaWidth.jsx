import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import { MIN_CUSTOM_STREET_WIDTH, MAX_CUSTOM_STREET_WIDTH } from './constants'
import { processWidthInput, prettifyWidth } from '../util/width_units'
import { loseAnyFocus } from '../util/focus'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../users/constants'
import { updateUnits } from '../users/localization'
import { segmentsChanged } from '../segments/view'
import { normalizeStreetWidth } from '../streets/width'
import { updateStreetWidth } from '../store/actions/street'

const STREET_WIDTH_CUSTOM = -1
const STREET_WIDTH_SWITCH_TO_METRIC = -2
const STREET_WIDTH_SWITCH_TO_IMPERIAL = -3

const DEFAULT_STREET_WIDTHS = [40, 60, 80]

class StreetMetaWidth extends React.Component {
  static propTypes = {
    intl: intlShape,
    editable: PropTypes.bool,
    street: PropTypes.object,
    updateStreetWidth: PropTypes.func
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
    this.selectRef = React.createRef()
  }

  /**
   * If the `isEditing` state has toggled to true, focus the <select>
   */
  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.isEditing === true && prevState.isEditing === false) {
      this.selectRef.current.focus()
    }
  }

  /**
   * When the street width label is clicked, only allow editing if street
   * width is not read-only
   */
  onClickStreetWidth = (event) => {
    if (this.props.editable) {
      this.setState({
        isEditing: true
      })
    }
  }

  onChangeStreetWidth = () => {
    this.setState({
      isEditing: false
    })

    let newStreetWidth = Number.parseInt(this.selectRef.current.value, 10)

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
        width = normalizeStreetWidth(processWidthInput(width, this.props.street.units), this.props.street.units)
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

    this.props.updateStreetWidth(normalizeStreetWidth(newStreetWidth, this.props.street.units))

    segmentsChanged()

    loseAnyFocus()
  }

  renderStreetWidthRemaining = () => {
    const { remainingWidth, units } = this.props.street
    const width = prettifyWidth(Math.abs(remainingWidth), units)
    const classNames = ['street-width-read-difference']

    if (remainingWidth > 0) {
      classNames.push('street-width-under')
      return (
        <span className={classNames.join(' ')}>
          <FormattedMessage id="width.under" defaultMessage="({width} room)" values={{ width }} />
        </span>
      )
    } else if (remainingWidth < 0) {
      classNames.push('street-width-over')
      return (
        <span className={classNames.join(' ')}>
          <FormattedMessage id="width.over" defaultMessage="({width} over)" values={{ width }} />
        </span>
      )
    }

    return null
  }

  renderStreetWidthLabel = () => {
    const width = prettifyWidth(this.props.street.width, this.props.street.units)

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
      <span className={className} title={title} onClick={this.onClickStreetWidth}>
        <FormattedMessage id="width.label" defaultMessage="{width} width" values={{ width }} />
        &nbsp;
        {this.renderStreetWidthRemaining()}
      </span>
    )
  }

  renderStreetWidthOption = (width, units) => {
    return (
      <option key={width} value={width}>
        {prettifyWidth(width, units)}
      </option>
    )
  }

  renderStreetWidthMenu = () => {
    const formatMessage = this.props.intl.formatMessage
    const { units, width, occupiedWidth } = this.props.street

    // Create options for default widths. This will also convert the widths
    // the proper units for the street.
    const defaultWidths = DEFAULT_STREET_WIDTHS.map((width) => normalizeStreetWidth(width, units))
    const DefaultWidthOptions = defaultWidths.map((width) => this.renderStreetWidthOption(width, units))

    // If the street width doesn't match any of the default widths,
    // render another choice representing the current width
    const CustomWidthOption = (defaultWidths.indexOf(Number.parseFloat(width)) === -1)
      ? (
        <React.Fragment>
          <option disabled />
          {this.renderStreetWidthOption(width, units)}
        </React.Fragment>
      ) : null

    return (
      <select
        ref={this.selectRef}
        onChange={this.onChangeStreetWidth}
        value={width}
        className="street-width-select"
        title={formatMessage({
          id: 'tooltip.street-width',
          defaultMessage: 'Change width of the street'
        })}
      >
        <option disabled>
          {formatMessage({ id: 'width.occupied', defaultMessage: 'Occupied width:' })}
        </option>
        <option disabled>
          {prettifyWidth(occupiedWidth, units)}
        </option>
        <option disabled />
        <option disabled>
          {formatMessage({ id: 'width.building', defaultMessage: 'Building-to-building width:' })}
        </option>
        {DefaultWidthOptions}
        {CustomWidthOption}
        <option value={STREET_WIDTH_CUSTOM} >
          {formatMessage({ id: 'width.different', defaultMessage: 'Different width…' })}
        </option>
        <option disabled />
        <option
          id="switch-to-imperial-units"
          value={STREET_WIDTH_SWITCH_TO_IMPERIAL}
          disabled={units === SETTINGS_UNITS_IMPERIAL}
        >
          {formatMessage({ id: 'width.imperial', defaultMessage: 'Switch to imperial units (feet)' })}
        </option>
        <option
          id="switch-to-metric-units"
          value={STREET_WIDTH_SWITCH_TO_METRIC}
          disabled={units === SETTINGS_UNITS_METRIC}
        >
          {formatMessage({ id: 'width.metric', defaultMessage: 'Switch to metric units' })}
        </option>
      </select>
    )
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
    editable: !state.app.readOnly && state.flags.EDIT_STREET_WIDTH.value
  }
}

const mapDispatchToProps = {
  updateStreetWidth
}

export default connect(mapStateToProps, mapDispatchToProps)(StreetMetaWidthWithIntl)
