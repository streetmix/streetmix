import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { useSelector, useDispatch } from 'react-redux'
import { setAnalyticsSource } from '../../store/actions/street'
import {
  SOURCE_VALUES,
  DEFAULT_ANALYTICS_SOURCE,
  SOURCE_LIST
} from '../../app/constants'

CapacitySource.propTypes = {
  segments: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string
    })
  )
}

function CapacitySource ({ segments = [] }) {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const handleChangeSource = (e) => {
    setIsLoading(true)
    let newSource = e.target.value
    if (!newSource || SOURCE_VALUES.indexOf(newSource) === -1) {
      newSource = DEFAULT_ANALYTICS_SOURCE
    }
    dispatch(setAnalyticsSource(newSource))
    setTimeout(() => setIsLoading(false), 100)
  }

  const analyticsSource = useSelector((state) => {
    return state.street
      ? state.street.analyticsSource
      : DEFAULT_ANALYTICS_SOURCE
  })
  const showSourceOptions = true

  const { citationUrl, citationLabel, citationSub } =
    SOURCE_LIST.find((item) => item.value === analyticsSource) || SOURCE_LIST[0]

  return (
    <>
      <p>
        <strong>
          <FormattedMessage
            id="dialogs.analytics.source"
            defaultMessage="Source"
          />
          :
        </strong>{' '}
        <em>
          <a href={citationUrl} target="_blank" rel="noopener noreferrer">
            {citationLabel}
          </a>
        </em>
        {citationSub}
      </p>
      {showSourceOptions && (
        <select
          disabled={isLoading}
          value={analyticsSource}
          onChange={handleChangeSource}
        >
          {SOURCE_LIST.map(({ label, value }) => {
            return (
              <option key={value} value={value}>
                {label}
              </option>
            )
          })}
        </select>
      )}
    </>
  )
}

export default CapacitySource
