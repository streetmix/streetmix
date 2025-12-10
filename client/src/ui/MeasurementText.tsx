import { memo } from 'react'

import { prettifyWidth } from '../util/width_units.js'

import type { UnitsSetting } from '@streetmix/types'

interface MeasurementTextProps {
  value: number
  units: UnitsSetting
  locale: string
}

function MeasurementText(props: MeasurementTextProps) {
  const { value, units, locale } = props

  return <span>{prettifyWidth(value, units, locale)}</span>
}

// This component is memoized because `prettifyWidth()` can be expensive
export default memo(MeasurementText)
