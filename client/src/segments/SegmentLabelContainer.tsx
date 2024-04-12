import React from 'react'
import { FormattedMessage } from 'react-intl'
import type { UnitsSetting } from '@streetmix/types'
import MeasurementText from '../ui/MeasurementText'
import { SETTINGS_UNITS_METRIC } from '../users/constants'
import { formatNumber } from '../util/number_format'
import './SegmentLabelContainer.scss'

interface SegmentLabelContainerProps {
  label: string | React.ReactElement
  locale: string
  width: number
  units: UnitsSetting
  showCapacity?: boolean
  capacity?: number
}

function SegmentLabelContainer (
  props: SegmentLabelContainerProps
): React.ReactElement {
  const { label, locale, width, units, showCapacity = false, capacity } = props

  const gridClassNames = ['segment-grid']

  // Add class names for measurement grid marks
  if (units === SETTINGS_UNITS_METRIC) {
    gridClassNames.push('units-metric')
  } else {
    gridClassNames.push('units-imperial')
  }

  return (
    <div className="segment-label-container">
      <div className={gridClassNames.join(' ')} />
      <div className="segment-width">
        <MeasurementText value={width} units={units} locale={locale} />
      </div>
      <div className="segment-label">
        <p className="segment-name">{label}</p>
        {showCapacity && capacity !== null && (
          <p className="segment-capacity">
            <FormattedMessage
              id="capacity.ppl-per-hour"
              defaultMessage="{capacity} people/hr"
              values={{
                capacity: formatNumber(capacity, locale)
              }}
            />
          </p>
        )}
      </div>
    </div>
  )
}

export default SegmentLabelContainer
