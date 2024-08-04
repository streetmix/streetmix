import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { showDialog } from '~/src/store/slices/dialogs'
import { getStreetCapacity } from '~/src/segments/capacity'
import Icon from '~/src/ui/Icon'
import { formatNumber } from '~/src/util/number_format'
import StreetMetaItem from './StreetMetaItem'

function StreetMetaAnalytics (): React.ReactElement | null {
  const street = useSelector((state) => state.street)
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()
  const intl = useIntl()

  const averageCapacity = getStreetCapacity(street).average ?? 0
  const tooltip = intl.formatMessage({
    id: 'dialogs.analytics.heading',
    defaultMessage: 'Analytics'
  })

  // If zero capacity, don't display anything
  if (averageCapacity > 0) {
    return (
      <StreetMetaItem
        isEditable={true}
        tooltip={tooltip}
        onClick={() => dispatch(showDialog('ANALYTICS'))}
        icon={<Icon name="graph" />}
      >
        <span className="underline">
          <FormattedMessage
            id="capacity.ppl-per-hour"
            defaultMessage="{capacity} people/hr"
            values={{ capacity: formatNumber(averageCapacity, locale) }}
          />
        </span>
      </StreetMetaItem>
    )
  }

  return null
}

export default StreetMetaAnalytics
