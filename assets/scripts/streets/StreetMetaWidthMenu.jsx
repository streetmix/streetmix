import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import Tooltip from '../ui/Tooltip'
import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '../users/constants'
import {
  prettifyWidth,
  convertImperialMeasurementToMetric
} from '../util/width_units'
import {
  STREET_WIDTH_CUSTOM,
  STREET_WIDTH_SWITCH_TO_METRIC,
  STREET_WIDTH_SWITCH_TO_IMPERIAL
} from './constants'
import './StreetMetaWidthMenu.scss'

const DEFAULT_STREET_WIDTHS_IMPERIAL = [40, 60, 80].map(
  convertImperialMeasurementToMetric
)
const DEFAULT_STREET_WIDTHS_METRIC = [12, 18, 24]

// Custom hook to focus an element after it's mounted
// To use, call this function in a ref prop
function useFocus () {
  const el = useRef(null)
  useEffect(() => {
    el.current.focus()
  }, [])
  return el
}

StreetMetaWidthMenu.propTypes = {
  street: PropTypes.shape({
    units: PropTypes.number,
    width: PropTypes.number,
    occupiedWidth: PropTypes.number
  }).isRequired,
  onChange: PropTypes.func.isRequired
}

function StreetMetaWidthMenu ({ street, onChange }) {
  function handleChange (event) {
    onChange(event.target.value)
  }

  function renderOption (width, units) {
    return (
      <option key={width} value={width}>
        {prettifyWidth(width, units)}
      </option>
    )
  }

  // Get ready to render
  const { formatMessage } = useIntl()
  const { units, width, occupiedWidth } = street

  // Create options for default widths. This will also convert the widths
  // the proper units for the street.
  const defaultWidths =
    units === SETTINGS_UNITS_IMPERIAL
      ? DEFAULT_STREET_WIDTHS_IMPERIAL
      : DEFAULT_STREET_WIDTHS_METRIC
  const DefaultWidthOptions = defaultWidths.map((width) =>
    renderOption(width, units)
  )

  // If the street width doesn't match any of the default widths,
  // render another choice representing the current width
  const CustomWidthOption =
    defaultWidths.indexOf(Number.parseFloat(width)) === -1
      ? (
        <>
          <option disabled={true} />
          {renderOption(width, units)}
        </>
        )
      : null

  return (
    <Tooltip
      label={formatMessage({
        id: 'tooltip.street-width',
        defaultMessage: 'Change width of the street'
      })}
      placement="bottom"
    >
      <select
        // Focus the <select> element after mounting
        ref={useFocus()}
        onChange={handleChange}
        value={width}
        className="street-width-select"
      >
        <option disabled={true}>
          {formatMessage({
            id: 'width.occupied',
            defaultMessage: 'Occupied width:'
          })}
        </option>
        <option disabled={true}>{prettifyWidth(occupiedWidth, units)}</option>
        <option disabled={true} />
        <option disabled={true}>
          {formatMessage({
            id: 'width.building',
            defaultMessage: 'Building-to-building width:'
          })}
        </option>
        {DefaultWidthOptions}
        {CustomWidthOption}
        <option value={STREET_WIDTH_CUSTOM}>
          {formatMessage({
            id: 'width.different',
            defaultMessage: 'Different width…'
          })}
        </option>
        <option disabled={true} />
        <option
          id="switch-to-imperial-units"
          value={STREET_WIDTH_SWITCH_TO_IMPERIAL}
          disabled={units === SETTINGS_UNITS_IMPERIAL}
        >
          {formatMessage({
            id: 'width.imperial',
            defaultMessage: 'Switch to imperial units (feet)'
          })}
        </option>
        <option
          id="switch-to-metric-units"
          value={STREET_WIDTH_SWITCH_TO_METRIC}
          disabled={units === SETTINGS_UNITS_METRIC}
        >
          {formatMessage({
            id: 'width.metric',
            defaultMessage: 'Switch to metric units'
          })}
        </option>
      </select>
    </Tooltip>
  )
}

export default StreetMetaWidthMenu
