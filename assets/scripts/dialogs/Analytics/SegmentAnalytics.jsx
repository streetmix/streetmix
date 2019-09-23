import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import SegmentForPalette from '../../segments/SegmentForPalette'
import { FormatNumber } from '../../util/formatting'
import { FormattedMessage } from 'react-intl'
import { getLocaleSegmentName } from '../../segments/view'

const BAR_HEIGHT = '70px'
const BAR_MODIFIER = 0.85
const BAR_COLORS = [
  { main: '#1a914e', alt: '#c8edd1' },
  { main: '#306c72', alt: '#dcf3f9' },
  { main: '#b56d48', alt: '#f9d5c0' },
  { main: '#536491', alt: '#d4dbe8' }
]

const CapacityBar = ({ amount, max, color }) => {
  const widthPercent = `${(Number.parseInt(amount, 10) / max) * 100}%`
  return (
    <div className="capacity-bar" style={{ height: BAR_HEIGHT, background: color, display: 'inline-block', width: widthPercent }} >&nbsp;</div>
  )
}

CapacityBar.propTypes = {
  amount: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired
}

const SegmentAnalytics = ({ type, capacity, segment, locale, index, chartMax }) => {
  const { average, potential } = capacity
  const label = getLocaleSegmentName(type, locale)
  const color = BAR_COLORS[index % BAR_COLORS.length]
  const widthPercent = `${(Number.parseInt(potential, 10) / Number.parseInt(chartMax, 10)) * (100 * BAR_MODIFIER)}`
  // leave 2% margin
  const widthPercentInv = `${98 - Number.parseFloat(widthPercent)}`

  return (
    <div className="segment-analytics">
      <div className="segment-icon">
        <SegmentForPalette
          isIcon
          key={segment.id}
          type={segment.type}
          variantString={segment.variantString}
        />
      </div>
      <div className="capacity-bars" style={{ width: `${widthPercent}%` }}>
        <CapacityBar amount={average} max={potential} color={color.main} />
        <CapacityBar amount={potential - average} max={potential} color={color.alt} />
      </div>
      <div className="capacity-text" style={{ width: `${widthPercentInv}%`, marginLeft: '2%' }}>
        <div className="capacity-label">{label}</div>
        <div className="capacity-summary">
          <FormattedMessage
            id="dialogs.analytics.segment-summary"
            defaultMessage="{average} — {potential} people/hour"
            values={{
              average: FormatNumber(locale, average),
              potential: FormatNumber(locale, potential)
            }}
          />
        </div>
      </div>
    </div>
  )
}

SegmentAnalytics.propTypes = {
  locale: PropTypes.string,
  index: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  chartMax: PropTypes.number.isRequired,
  capacity: PropTypes.shape({
    average: PropTypes.number,
    potential: PropTypes.number
  }).isRequired,
  segment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    variantString: PropTypes.string.isRequired
  }).isRequired
}

function mapStateToProps (state) {
  return {
    street: state.street,
    locale: state.locale.locale
  }
}

export default connect(mapStateToProps)(SegmentAnalytics)
