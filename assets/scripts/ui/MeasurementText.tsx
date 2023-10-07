import React, { memo } from 'react'
import {
  SETTINGS_UNITS_METRIC,
  type SETTINGS_UNITS_IMPERIAL
} from '../users/constants'
import { prettifyWidth } from '../util/width_units'

interface MeasurementTextProps {
  value: number
  units?: typeof SETTINGS_UNITS_METRIC | typeof SETTINGS_UNITS_IMPERIAL
  locale: string
}

function MeasurementText (props: MeasurementTextProps): React.ReactElement {
  const { value, units = SETTINGS_UNITS_METRIC, locale } = props

  return <span>{prettifyWidth(value, units, locale)}</span>
}

// This component is memoized because `prettifyWidth()` can be expensive
export default memo(MeasurementText)
