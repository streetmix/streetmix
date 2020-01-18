import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { getStreetCapacity, formatCapacity } from '../util/street_analytics'
import { showDialog } from '../store/actions/dialogs'

function StreetMetaAnalytics (props) {
  const street = useSelector((state) => state.street)
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()

  const averageTotal = getStreetCapacity(street, locale).averageTotal

  // For zero capacity, don't display anything
  return (
    Number.parseInt(averageTotal, 10) > 0 && (
      <span className="street-metadata-analytics">
        <a href="#" onClick={() => dispatch(showDialog('ANALYTICS'))}>
          <FormattedMessage
            id="capacity.ppl-per-hour"
            defaultMessage="{capacity} people/hr"
            values={{ capacity: formatCapacity(averageTotal) }}
          />
        </a>
      </span>
    )
  )
}

export default StreetMetaAnalytics
