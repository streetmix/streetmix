import React, { useState, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { setShowAnalytics } from '~/src/store/actions/street'
import Terms from '~/src/app/Terms'
import Button from '~/src/ui/Button'
import Checkbox from '~/src/ui/Checkbox'
import ExternalLink from '~/src/ui/ExternalLink'
import Icon from '~/src/ui/Icon'
import { isOwnedByCurrentUser } from '~/src/streets/owner'
import { formatNumber } from '~/src/util/number_format'
import {
  getCapacityData,
  getStreetCapacity,
  getRolledUpSegmentCapacities,
  saveCsv
} from '~/src/segments/capacity'
import { SETTINGS_UNITS_IMPERIAL } from '~/src/users/constants'
import Dialog from '../Dialog'
import CapacitySources from './CapacitySources'
import SegmentAnalytics from './SegmentAnalytics'
import './AnalyticsDialog.css'

function AnalyticsDialog (): React.ReactElement {
  const street = useSelector((state) => state.street)
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()
  const intl = useIntl()
  const max = useRef(0)

  const [isVisible, setVisible] = useState(street.showAnalytics)
  const toggleVisible = (): void => {
    setVisible(!isVisible)
    dispatch(setShowAnalytics(!isVisible))
  }

  const capacityData = getCapacityData(street.capacitySource)
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

  // Displays typical lane width from the data source, if present. Values are
  // manually set for each unit type (metric or imperial) instead of using the
  // `prettifyWidth` helper, which has imprecise rounding. While every data
  // source we have right now does have an assumed lane width, this property
  // is optional, in case of future data sources that calculate capacity using
  // lane width as an input variable.
  let laneWidth

  if (street.units === SETTINGS_UNITS_IMPERIAL) {
    laneWidth = `${capacityData.typical_lane_width.imperial} ft`
  } else {
    laneWidth = `${capacityData.typical_lane_width.metric} m`
  }

  const widthText = (
    <FormattedMessage
      id="dialogs.analytics.typical-lane-width"
      defaultMessage="Capacity values are based on {laneWidth}-wide lanes."
      values={{ laneWidth }}
    />
  )

  const rolledUp = getRolledUpSegmentCapacities(street)

  // Store the maximum capacity across renders, when the data source may
  // change. This way, data sources with lower values show more intuitive
  // animation between the relative differences. (Note: one downside of this
  // method is that the 'max' is only calculated with data sources that are
  // being tried - we don't calculate the max across _all_ data sources right
  // away. The City of Vancouver data (with the lowest capacity numbers) will
  // display at max width, even though it would be significantly shorter if
  // you switched to the TUMI/GIZ data first and then back to Vancouver. This
  // is a tradeoff I'm willing to live with, unless user feedback really
  // requires us to change this.)
  max.current = Math.max(
    max.current,
    ...rolledUp.map((item) => item.capacity?.potential ?? 0)
  )

  function exportCSV (): void {
    const name =
      street.name ??
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
              <p>
                {summary} {widthText}
              </p>
              {rolledUp.map((item, index) => (
                <SegmentAnalytics
                  key={index}
                  index={index}
                  max={max.current}
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
                {capacityData.source_url !== undefined
                  ? (
                    <ExternalLink href={capacityData.source_url}>
                      {capacityData.source_title}
                    </ExternalLink>
                    )
                  : (
                      capacityData.source_title
                    )}
                , {capacityData.source_author}
              </p>
            </div>
            <hr />
            <div className="dialog-actions">
              <CapacitySources />
              <Checkbox
                checked={isVisible}
                onChange={toggleVisible}
                disabled={!isOwnedByCurrentUser()}
              >
                <FormattedMessage
                  id="dialogs.analytics.toggle-visible"
                  defaultMessage="Show capacity counts in segment labels"
                />
              </Checkbox>
              {!isOwnedByCurrentUser() && (
                <p className="analytics-settings-notice">
                  <Icon name="help" />
                  <FormattedMessage
                    id="dialogs.analytics.settings-notice"
                    defaultMessage="Street owners can change these settings."
                  />
                </p>
              )}
              <br />
              <Button primary onClick={exportCSV}>
                <FormattedMessage
                  id="dialogs.analytics.export-csv"
                  defaultMessage="Export as CSV"
                />
              </Button>
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
