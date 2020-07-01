import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { useSelector, useDispatch } from 'react-redux'
import {
  updateStreetSegmentCapacity,
  setAnalyticsSource
} from '../../store/actions/street'
import { getCapacityBySource } from '../../util/street_analytics'

const SOURCES = ['defaultSource', 'foo', 'bar']
const SOURCE_OPTIONS = [
  {
    label: 'Default Source',
    value: 'defaultSource',
    citationUrl:
      'http://www.uncrd.or.jp/content/documents/5594Presentation%203%20-%20Module%201%20-%20Mr.%20Breithaupt.pdf',
    citationLabel:
      'Environmentally Sustainable Transport - Main Principles and Impacts',
    citationSub:
      ', Manfred Breithaupt, Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ)'
  },
  {
    label: 'Foo Source',
    value: 'foo',
    citationUrl: 'http://google.com',
    citationLabel: 'Study of Foo in Public Spaces',
    citationSub: ', Some more text for Foo goes here'
  },
  {
    label: 'Bar Source',
    value: 'bar',
    citationUrl: 'http://streetmix.net',
    citationLabel: 'Study of Bar in Public Spaces',
    citationSub: ', Some more text for Bar goes here'
  }
]
const CapacitySource = ({ segments = [] }) => {
  const dispatch = useDispatch()
  const [loading, setIsLoading] = useState(false)
  const onChangeSource = (e) => {
    setIsLoading(true)
    let newSource = e.target.value
    // dispatch(updateStreetSegmentCapacity(index, value))
    if (!newSource || SOURCES.indexOf(newSource) === -1) {
      newSource = 'defaultSource'
    }

    segments.forEach((item, index) => {
      const value = getCapacityBySource(item.type, newSource)
      dispatch(updateStreetSegmentCapacity(index, value))
    })
    dispatch(setAnalyticsSource(newSource))
    setIsLoading(false)
  }

  const analyticsSource = useSelector((state) => {
    return state.street ? state.street.analyticsSource : 'defaultSource'
  })
  const showSourceOptions = true

  const { citationUrl, citationLabel, citationSub } =
    SOURCE_OPTIONS.find((item) => item.value === analyticsSource) ||
    SOURCE_OPTIONS[0]

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
      {loading && <span>loading...</span>}
      {showSourceOptions && (
        <select
          disabled={loading}
          value={analyticsSource}
          onChange={onChangeSource}
        >
          {SOURCE_OPTIONS.map(({ label, value }) => {
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
