import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { useSelector, useDispatch } from 'react-redux'
import {
  updateStreetSegmentCapacity,
  setAnalyticsSource
} from '../../store/actions/street'
import { getCapacityBySource } from '../../util/street_analytics'
import { SOURCE_VALUES, SOURCE_LIST } from '../../app/constants'

const CapacitySource = ({ segments = [] }) => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const handleChangeSource = (e) => {
    setIsLoading(true)
    let newSource = e.target.value
    if (!newSource || SOURCE_VALUES.indexOf(newSource) === -1) {
      newSource = SOURCE_VALUES[0]
    }

    segments.forEach((item, index) => {
      const value = getCapacityBySource(item.type, newSource)
      dispatch(updateStreetSegmentCapacity(index, value))
    })
    dispatch(setAnalyticsSource(newSource))
    setIsLoading(false)
  }

  const analyticsSource = useSelector((state) => {
    return state.street ? state.street.analyticsSource : SOURCE_VALUES[0]
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
      {isLoading && <span>loading...</span>}
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

CapacitySource.displayName = 'CapacitySource'

CapacitySource.propTypes = {
  segments: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string
    })
  )
}

export default CapacitySource
