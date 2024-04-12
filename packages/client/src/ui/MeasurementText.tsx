import React, { memo } from 'react'
import type { UnitsSetting } from '@streetmix/types'
import { prettifyWidth } from '../util/width_units'

interface MeasurementTextProps {
  value: number
  units: UnitsSetting
  locale: string
}

function MeasurementText (props: MeasurementTextProps): React.ReactElement {
  const { value, units, locale } = props

  return <span>{prettifyWidth(value, units, locale)}</span>
}

// This component is memoized because `prettifyWidth()` can be expensive
export default memo(MeasurementText)
