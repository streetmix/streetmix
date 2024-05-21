import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { setUserUnits } from '~/src/store/slices/settings'
import RadioGroup from '~/src/ui/RadioGroup'
import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '~/src/users/constants'

// This is user-level setting! It does not adjust street units, as
// it did in the past. The main effect is that you only see this
// for new streets.
function UnitSettings (): React.ReactElement {
  const units = useSelector((state) => state.settings.units)
  const dispatch = useDispatch()
  const intl = useIntl()

  function handleValueChange (value: string): void {
    if (value === 'metric') {
      dispatch(setUserUnits(SETTINGS_UNITS_METRIC))
    } else {
      dispatch(setUserUnits(SETTINGS_UNITS_IMPERIAL))
    }
  }

  return (
    <section>
      <h2>
        <FormattedMessage id="settings.units.label" defaultMessage="Units" />
      </h2>
      <RadioGroup
        name="units"
        value={units === SETTINGS_UNITS_METRIC ? 'metric' : 'imperial'}
        defaultValue="metric"
        onValueChange={handleValueChange}
        values={[
          {
            value: 'metric',
            label: intl.formatMessage({
              id: 'settings.units.metric',
              defaultMessage: 'Metric (meters)'
            })
          },
          {
            value: 'imperial',
            label: intl.formatMessage({
              id: 'settings.units.imperial',
              defaultMessage: 'U.S. customary / imperial (feet and inches)'
            })
          }
        ]}
      />
    </section>
  )
}

export default UnitSettings
