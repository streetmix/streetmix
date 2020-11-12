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
import Terms from '../app/Terms'
import Checkbox from '../ui/Checkbox'
import ExternalLink from '../ui/ExternalLink'
import { updateStreetAnalytics } from '../store/actions/street'
import { formatNumber } from '../util/number_format'
import {
  getCapacityData,
  getStreetCapacity,
  getRolledUpSegmentCapacities,
  saveCsv
} from '../util/street_analytics'
import './AnalyticsDialog.scss'

function AnalyticsDialog (props) {
  const street = useSelector((state) => state.street)
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()
  const intl = useIntl()

  const [isVisible, setVisible] = useState(street.showAnalytics)
  const toggleVisible = () => {
    setVisible(!isVisible)
    dispatch(updateStreetAnalytics(!isVisible))
  }

  const capacityData = getCapacityData()
  const capacity = getStreetCapacity(street)
  const options = { maximumSignificantDigits: 3 }

  const summary = (
    <FormattedMessage
      id="dialogs.analytics.street-summary"
      defaultMessage="Your street has an estimated average traffic of {averageTotal} people per hour, and potential for up to {potentialTotal} people per hour."
      values={{
        averageTotal: <b>{formatNumber(capacity.average, locale, options)}</b>,
        potentialTotal: (
          <b>{formatNumber(capacity.potential, locale, options)}</b>
        )
      }}
    />
  )

  const rolledUp = getRolledUpSegmentCapacities(street)
  const chartMax = Math.max(...rolledUp.map((item) => item.capacity.potential))

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
              {rolledUp.map((item, index) => (
                <SegmentAnalytics
                  key={index}
                  index={index}
                  chartMax={chartMax}
                  type={item.type}
                  capacity={item.capacity}
                />
              ))}
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
