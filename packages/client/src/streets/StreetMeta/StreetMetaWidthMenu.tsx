import React, { useEffect, useRef } from 'react'
import { useIntl } from 'react-intl'
import type { StreetJsonExtra } from '@streetmix/types'
import { useSelector } from '../../store/hooks'
import Tooltip from '../../ui/Tooltip'
import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '../../users/constants'
import {
  prettifyWidth,
  convertImperialMeasurementToMetric
} from '../../util/width_units'
import {
  STREET_WIDTH_CUSTOM,
  STREET_WIDTH_SWITCH_TO_METRIC,
  STREET_WIDTH_SWITCH_TO_IMPERIAL
} from '../constants'
import './StreetMetaWidthMenu.scss'

const DEFAULT_STREET_WIDTHS_IMPERIAL = [40, 60, 80].map(
  convertImperialMeasurementToMetric
)
const DEFAULT_STREET_WIDTHS_METRIC = [12, 18, 24]

interface StreetMetaWidthMenuProps {
  street: StreetJsonExtra
  onChange: (value: string) => void
}

function StreetMetaWidthMenu ({
  street,
  onChange
}: StreetMetaWidthMenuProps): React.ReactElement {
  const ref = useRef<HTMLSelectElement>(null)
  const locale = useSelector((state) => state.locale.locale)
  const { formatMessage } = useIntl()

  const { units, width, occupiedWidth } = street
  const defaultWidths =
    units === SETTINGS_UNITS_IMPERIAL
      ? DEFAULT_STREET_WIDTHS_IMPERIAL
      : DEFAULT_STREET_WIDTHS_METRIC

  // Focus the <select> element after mounting
  useEffect(() => {
    if (ref.current !== null) {
      ref.current.focus()
    }
  }, [])

  function handleChange (event: React.ChangeEvent<HTMLSelectElement>): void {
    onChange(event.target.value)
  }

  const Option = ({ width }: { width: number }): React.ReactElement => (
    <option key={width} value={width}>
      {prettifyWidth(width, units, locale)}
    </option>
  )

  const DefaultWidthOptions = (): React.ReactElement[] =>
    defaultWidths.map((width) => <Option key={width} width={width} />)

  // If the street width doesn't match any of the default widths,
  // render another choice representing the current width
  const CustomWidthOption = (): React.ReactElement | null =>
    defaultWidths.includes(width)
      ? null
      : (
        <>
          <option disabled={true} />
          <Option width={width} />
        </>
        )

  return (
    <Tooltip
      label={formatMessage({
        id: 'tooltip.street-width',
        defaultMessage: 'Change width of the street'
      })}
      placement="bottom"
    >
      <select
        ref={ref}
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
        <option disabled={true}>
          {prettifyWidth(occupiedWidth, units, locale)}
        </option>
        <option disabled={true} />
        <option disabled={true}>
          {formatMessage({
            id: 'width.building',
            defaultMessage: 'Building-to-building width:'
          })}
        </option>
        <DefaultWidthOptions />
        <CustomWidthOption />
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
