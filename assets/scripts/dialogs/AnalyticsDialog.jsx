/**
 * Street Analytics (dialog box)
 *
 * Renders the "Analytics" dialog box.
 *
 */
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import PropTypes from 'prop-types'
import Dialog from './Dialog'
import SegmentAnalytics from './Analytics/SegmentAnalytics'
import { FormatNumber } from '../util/formatting'
import { trackEvent } from '../app/event_tracking'
import Terms from '../app/Terms'
import { getSegmentCapacity, capacitySum, saveCsv } from '../util/street_analytics'

import './AnalyticsDialog.scss'

const addSegmentData = (segments) => {
  // return segments.map(getSegmentCapacity)
  return segments.map(item => {
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
  return Object.keys(map).map(key => map[key])
}

const rollUpCategories = (arr) => {
  return groupBy(arr, item => item.type)
}

const avgCapacityAscending = (a, b) => {
  return a.capacity.average - b.capacity.average
}

function AnalyticsDialog (props) {
  useEffect(() => {
    trackEvent('Interaction', 'Open analytics dialog box', null, null, false)
  }, [])

  const intl = useIntl()
  const segmentData = addSegmentData(props.street.segments).sort(avgCapacityAscending)

  const sumFunc = (total, num) => {
    if (!Number.isInteger(num)) return total
    return total + num
  }

  const averageTotal = segmentData.map(item => item.capacity.average).reduce(sumFunc, 0)
  const potentialTotal = segmentData.map(item => item.capacity.potential).reduce(sumFunc, 0)

  const summary = (<FormattedMessage
    id="dialogs.analytics.street-summary"
    defaultMessage="Your street has an estimated average traffic of {averageTotal} passengers per hour, and potential for up to {potentialTotal} passengers per hour."
    values={{
      averageTotal: <b>{FormatNumber(props.locale, averageTotal)}</b>,
      potentialTotal: <b>{FormatNumber(props.locale, potentialTotal)}</b>
    }}
  />)

  const getRolledCapacity = item => Number.isInteger(item.capacity.potential) ? item.capacity.potential : 0
  const hasRolledCapacity = item => Number.isInteger(item.capacity.potential)

  const rolledUp = rollUpCategories(segmentData)
  const chartMax = Math.max(...rolledUp.map(getRolledCapacity)) + 1000

  function exportCSV () {
    const name = props.street.name || intl.formatMessage({
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
              <FormattedMessage id="dialogs.analytics.heading" defaultMessage="Analytics" />
            </h1>
          </header>
          <div className="dialog-content">
            <div className="analytics-dialog-content">
              <p>
                {summary}
              </p>
              {rolledUp.filter(hasRolledCapacity).map((item, index) => (item.capacity.average > 0) && <SegmentAnalytics index={index} {...item} chartMax={chartMax} />)}
              <p>
                <strong>Source:</strong> <em><a href="">Environmentally Sustainable Transport - Main Principles and Impacts</a></em>, Manfred Breithaupt, Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ)
              </p>
            </div>
            <div className="dialog-actions">
              <button onClick={exportCSV}>
                <FormattedMessage id="dialogs.analytics.export-csv" defaultMessage="Export as CSV" />
              </button>
              <footer>
                <Terms locale={props.locale} />
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

function mapStateToProps (state) {
  return {
    street: state.street,
    locale: state.locale.locale
  }
}

AnalyticsDialog.propTypes = {
  street: PropTypes.object,
  locale: PropTypes.string
}

export default connect(mapStateToProps)(AnalyticsDialog)
