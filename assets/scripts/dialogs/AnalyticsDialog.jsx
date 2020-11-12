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
import { formatNumber } from '../util/number_format'
import { updateStreetAnalytics } from '../store/actions/street'

import Terms from '../app/Terms'
import {
  getCapacityData,
  getSegmentCapacity,
  capacitySum,
  saveCsv
} from '../util/street_analytics'
import './AnalyticsDialog.scss'

const addSegmentData = (segments) => {
  return segments
    .map((item) => {
      return {
        type: item.type,
        capacity: getSegmentCapacity(item),
        segment: item
      }
    })
    .filter((item) => item.capacity !== null)
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

  const capacityData = getCapacityData()

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
  const options = { maximumSignificantDigits: 3 }

  const summary = (
    <FormattedMessage
      id="dialogs.analytics.street-summary"
      defaultMessage="Your street has an estimated average traffic of {averageTotal} people per hour, and potential for up to {potentialTotal} people per hour."
      values={{
        averageTotal: <b>{formatNumber(averageTotal, locale, options)}</b>,
        potentialTotal: <b>{formatNumber(potentialTotal, locale, options)}</b>
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
                <ExternalLink href={capacityData.source_url}>
                  {capacityData.source_title}
                </ExternalLink>
                , {capacityData.source_author}
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
