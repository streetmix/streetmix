import { FormattedMessage } from 'react-intl'

import MeasurementText from '../ui/MeasurementText.js'
import { SETTINGS_UNITS_METRIC } from '../users/constants.js'
import { formatNumber } from '../util/number_format.js'
import './SegmentLabelContainer.css'

import type { UnitsSetting } from '@streetmix/types'

interface SegmentLabelContainerProps {
  label: string | React.ReactElement
  locale: string
  width: number
  units: UnitsSetting
  showCapacity?: boolean
  capacity?: number
}

export function SegmentLabelContainer(props: SegmentLabelContainerProps) {
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
        {showCapacity && capacity !== undefined && (
          <p className="segment-capacity">
            <FormattedMessage
              id="capacity.ppl-per-hour"
              defaultMessage="{capacity} people/hr"
              values={{
                capacity: formatNumber(capacity, locale),
              }}
            />
          </p>
        )}
      </div>
    </div>
  )
}
