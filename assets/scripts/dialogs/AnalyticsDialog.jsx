/**
 * Street Analytics (dialog box)
 *
 * Renders the "Analytics" dialog box.
 *
 */
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import Dialog from './Dialog'
import SegmentAnalytics from './Analytics/SegmentAnalytics'
import { FormatNumber } from '../util/formatting'
import { trackEvent } from '../app/event_tracking'
import './AnalyticsDialog.scss'

const NO_CAPACITY = { average: 0, potential: 0 }

const CAPACITIES = {
  'sidewalk': { average: 19000, potential: 19000 },
  'drive-lane': { average: 1500, potential: 2000 },
  'bike-lane': { average: 14000, potential: 14000 },
  'scooter': { average: 14000, potential: 14000 },
  'light-rail': { average: 18000, potential: 20000 },
  'streetcar': { average: 18000, potential: 20000 },
  'bus-lane': { average: 5000, potential: 8000 }
}

const getCapacity = (type) => {
  return CAPACITIES[type] || NO_CAPACITY
}

const addSegmentData = (segments) => {
  return segments.map(item => {
    return {
      label: `${item.variantString} ${item.type}`,
      capacity: getCapacity(item.type),
      segment: item
    }
  })
}

function AnalyticsDialog (props) {
  useEffect(() => {
    trackEvent('Interaction', 'Open analytics dialog box', null, null, false)
  }, [])

  const segmentData = addSegmentData(props.street.segments)

  const sumFunc = (total, num) => {
    return total + num
  }

  const averageTotal = segmentData.map(item => item.capacity.average).reduce(sumFunc)
  const potentialTotal = segmentData.map(item => item.capacity.potential).reduce(sumFunc)

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="analytics-dialog">
          <header>
            <h1>
              <FormattedMessage id="dialogs.analytics.heading" defaultMessage="analytics Streetmix." />
            </h1>
          </header>
          <div className="dialog-content">
            <div className="analytics-dialog-content">
              <h2>Summary</h2>
              <div>
                Your street has an estimated average traffic of <b>{FormatNumber(props.locale, averageTotal)}</b> passengers per hour, and potential for up to <b>{FormatNumber(props.locale, potentialTotal)}</b> passengers per hour.
              </div>
              <h2>Capacity By Segment</h2>
              {segmentData.map(item => (item.capacity.average > 0) && <SegmentAnalytics {...item} />)}
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
