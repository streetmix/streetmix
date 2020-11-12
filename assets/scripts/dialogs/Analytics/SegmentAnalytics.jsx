import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { getLocaleSegmentName } from '../../segments/view'
import CapacityMessage from './CapacityMessage'
import CapacityBar from './CapacityBar'

const BAR_MODIFIER = 0.85
const BAR_COLORS = [
  { main: '#1a914e', alt: '#c8edd1' },
  { main: '#306c72', alt: '#dcf3f9' },
  { main: '#b56d48', alt: '#f9d5c0' },
  { main: '#536491', alt: '#d4dbe8' }
]

SegmentAnalytics.propTypes = {
  index: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  chartMax: PropTypes.number.isRequired,
  capacity: PropTypes.shape({
    average: PropTypes.number,
    potential: PropTypes.number
  }).isRequired
}

function SegmentAnalytics ({ index, type, chartMax, capacity }) {
  const locale = useSelector((state) => state.locale.locale)

  const { average, potential } = capacity
  const label = getLocaleSegmentName(type, locale)
  const color = BAR_COLORS[index % BAR_COLORS.length]
  const widthPercent = `${
    (potential / (chartMax + 1000)) * (100 * BAR_MODIFIER)
  }`
  // leave 2% margin
  const widthPercentInv = `${98 - Number.parseFloat(widthPercent)}`

  if (average === 0) return null

  return (
    <div className="segment-analytics">
      <div className="capacity-bars" style={{ width: `${widthPercent}%` }}>
        <CapacityBar amount={average} max={potential} color={color.main} />
        <CapacityBar
          amount={potential - average}
          max={potential}
          color={color.alt}
        />
      </div>
      <div
        className="capacity-text"
        style={{ width: `${widthPercentInv}%`, marginLeft: '2%' }}
      >
        <div className="capacity-label">{label}</div>
        <div className="capacity-summary">
          <CapacityMessage
            average={average}
            potential={potential}
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}

export default SegmentAnalytics
