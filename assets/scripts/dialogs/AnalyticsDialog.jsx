/**
 * Street Analytics (dialog box)
 *
 * Renders the "Analytics" dialog box.
 *
 */
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import Dialog from './Dialog'
import SegmentAnalytics from './Analytics/SegmentAnalytics'
import Checkbox from '../ui/Checkbox'
import ExternalLink from '../ui/ExternalLink'
import { FormatNumber } from '../util/formatting'
import { updateStreetAnalytics } from '../store/actions/street'

import Terms from '../app/Terms'
import {
  getSegmentCapacity,
  capacitySum,
  saveCsv
} from '../util/street_analytics'
import './AnalyticsDialog.scss'

const addSegmentData = (segments) => {
  // return segments.map(getSegmentCapacity)
  return segments.map((item) => {
    return {
      type: item.type,
      capacity: getSegmentCapacity(item).capacity,
      segment: item
    }
  })
}

const mergeSegments = (a, b) => ({
  type: a.type,
  segment: a.segment,
  capacity: capacitySum(a.capacity, b.capacity)
})

const groupBy = (list, keyGetter) => {
  const map = {}
  list.forEach((item) => {
    const key = keyGetter(item)
    const record = map[key]
    if (!record) {
      map[key] = item
    } else {
      const newItem = mergeSegments(item, record)
      map[key] = newItem
    }
  })
  return Object.keys(map).map((key) => map[key])
}

const rollUpCategories = (arr) => {
  return groupBy(arr, (item) => item.type)
}

const avgCapacityAscending = (a, b) => {
  return a.capacity.average - b.capacity.average
}

function AnalyticsDialog (props) {
  const street = useSelector((state) => state.street)
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()

  const [isVisible, setVisible] = useState(street.showAnalytics)
  const toggleVisible = () => {
    setVisible(!isVisible)
    dispatch(updateStreetAnalytics(!isVisible))
  }

  const intl = useIntl()
  const segmentData = addSegmentData(street.segments).sort(avgCapacityAscending)

  const sumFunc = (total, num) => {
    if (!Number.isInteger(num)) return total
    return total + num
  }

  const averageTotal = segmentData
    .map((item) => item.capacity.average)
    .reduce(sumFunc, 0)
  const potentialTotal = segmentData
    .map((item) => item.capacity.potential)
    .reduce(sumFunc, 0)

  const summary = (
    <FormattedMessage
      id="dialogs.analytics.street-summary"
      defaultMessage="Your street has an estimated average traffic of {averageTotal} people per hour, and potential for up to {potentialTotal} people per hour."
      values={{
        averageTotal: <b>{FormatNumber(locale, averageTotal)}</b>,
        potentialTotal: <b>{FormatNumber(locale, potentialTotal)}</b>
      }}
    />
  )

  const displayCapacity = (item) => {
    return (
      item.capacity &&
      item.capacity.display !== false &&
      item.capacity.average > 0
    )
  }

  const rolledUp = rollUpCategories(segmentData)
  const chartMax =
    Math.max(...rolledUp.map((item) => item.capacity.potential)) + 1000

  function exportCSV () {
    const name =
      street.name ||
      intl.formatMessage({
        id: 'street.default-name',
        defaultMessage: 'Unnamed St'
      })
    saveCsv(rolledUp, name)
  }

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="analytics-dialog">
          <header>
            <h1>
              <FormattedMessage
                id="dialogs.analytics.heading"
                defaultMessage="Analytics"
              />
            </h1>
          </header>
          <div className="dialog-content">
            <div className="analytics-dialog-content">
              <p>{summary}</p>
              {rolledUp
                .filter(displayCapacity)
                .map(
                  (item, index) =>
                    item.capacity.average > 0 && (
                      <SegmentAnalytics
                        index={index}
                        key={index}
                        {...item}
                        chartMax={chartMax}
                      />
                    )
                )}
              <p>
                <strong>
                  <FormattedMessage
                    id="dialogs.analytics.source"
                    defaultMessage="Source"
                  />
                  :
                </strong>{' '}
                <ExternalLink href="https://www.transformative-mobility.org/publications/passenger-capacity-of-different-transport-modes">
                  Passenger capacity of different transport modes
                </ExternalLink>
                , Transformative Urban Mobility Initiative (TUMI)
              </p>
            </div>
            <div className="dialog-actions">
              <Checkbox
                id="show-analytics"
                checked={isVisible}
                onChange={toggleVisible}
              >
                <FormattedMessage
                  id="dialogs.analytics.toggle-visible"
                  defaultMessage="Show capacity counts in segment labels"
                />
              </Checkbox>

              <br />
              <button className="button-primary" onClick={exportCSV}>
                <FormattedMessage
                  id="dialogs.analytics.export-csv"
                  defaultMessage="Export as CSV"
                />
              </button>
              <footer>
                <Terms locale={locale} />
              </footer>
            </div>
          </div>
          <button className="dialog-primary-action" onClick={closeDialog}>
            <FormattedMessage id="btn.close" defaultMessage="Close" />
          </button>
        </div>
      )}
    </Dialog>
  )
}

export default AnalyticsDialog
