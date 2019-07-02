import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../users/constants'
import { normalizeStreetWidth } from '../streets/width'
import { prettifyWidth } from '../util/width_units'
import {
  STREET_WIDTH_CUSTOM,
  STREET_WIDTH_SWITCH_TO_METRIC,
  STREET_WIDTH_SWITCH_TO_IMPERIAL
} from './constants'
import './StreetMetaWidthMenu.scss'

const DEFAULT_STREET_WIDTHS = [40, 60, 80]

// Custom hook to focus an element after it's mounted
// To use, call this function in a ref prop
function useFocus () {
  const el = useRef(null)
  useEffect(() => {
    el.current.focus()
  }, [])
  return el
}

const StreetMetaWidthMenu = (props) => {
  function handleChange (event) {
    props.onChange(event.target.value)
  }

  function renderOption (width, units) {
    return (
      <option key={width} value={width}>
        {prettifyWidth(width, units)}
      </option>
    )
  }

  // Get ready to render
  const formatMessage = props.formatMessage
  const { units, width, occupiedWidth } = props.street

  // Create options for default widths. This will also convert the widths
  // the proper units for the street.
  const defaultWidths = DEFAULT_STREET_WIDTHS.map((width) => normalizeStreetWidth(width, units))
  const DefaultWidthOptions = defaultWidths.map((width) => renderOption(width, units))

  // If the street width doesn't match any of the default widths,
  // render another choice representing the current width
  const CustomWidthOption = (defaultWidths.indexOf(Number.parseFloat(width)) === -1)
    ? (
      <React.Fragment>
        <option disabled />
        {renderOption(width, units)}
      </React.Fragment>
    ) : null

  return (
    <select
      // Focus the <select> element after mounting
      ref={useFocus()}
      onChange={handleChange}
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

StreetMetaWidthMenu.propTypes = {
  // pass intl's formatMessage() to here to avoid HOC wrapper
  formatMessage: PropTypes.func.isRequired,

  // from parent component
  street: PropTypes.shape({
    units: PropTypes.number,
    width: PropTypes.number,
    occupiedWidth: PropTypes.number
  }).isRequired,
  onChange: PropTypes.func.isRequired
}

export default StreetMetaWidthMenu
