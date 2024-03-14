import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { IoPodiumOutline } from 'react-icons/io5'
import { useSelector, useDispatch } from '../../store/hooks'
import { showDialog } from '../../store/slices/dialogs'
import Tooltip from '../../ui/Tooltip'
import { getStreetCapacity } from '../../segments/capacity'
import { formatNumber } from '../../util/number_format'

function StreetMetaAnalytics (): React.ReactElement | null {
  const street = useSelector((state) => state.street)
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()
  const intl = useIntl()

  const averageCapacity = getStreetCapacity(street).average ?? 0
  const title = intl.formatMessage({
    id: 'dialogs.analytics.heading',
    defaultMessage: 'Analytics'
  })

  // If zero capacity, don't display anything
  if (averageCapacity > 0) {
    return (
      <Tooltip label={title} placement="bottom">
        <span className="street-metadata-analytics">
          <IoPodiumOutline />
          <a onClick={() => dispatch(showDialog('ANALYTICS'))}>
            <FormattedMessage
              id="capacity.ppl-per-hour"
              defaultMessage="{capacity} people/hr"
              values={{ capacity: formatNumber(averageCapacity, locale) }}
            />
          </a>
        </span>
      </Tooltip>
    )
  }

  return null
}

export default StreetMetaAnalytics
