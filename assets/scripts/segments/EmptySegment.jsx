import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import SegmentLabelContainer from './SegmentLabelContainer'
import { TILE_SIZE } from '../segments/constants'
import './EmptySegment.scss'

/**
 * This is a "presentational" component in the React presentational/container
 * component pattern. Its "container" (parent) component, <EmptySegmentContainer />,
 * determines and passes the `width` and `left` props to this component.
 */
export function EmptySegment (props) {
  const { width, left, units, locale } = props

  // Do not render if width is a negative number
  if (width <= 0) return null

  // Inline style specifies size and position
  // `width` and `left` are provided as real-world measurements. This is
  // multiplied by TILE_SIZE to get the pixel dimension and offset.
  const style = {
    width: (width * TILE_SIZE) + 'px',
    left: (left * TILE_SIZE) + 'px'
  }

  return (
    <div className="segment segment-empty" style={style}>
      <SegmentLabelContainer
        label={<FormattedMessage id="section.empty" defaultMessage="Empty space" />}
        width={width}
        units={units}
        locale={locale}
      />
    </div>
  )
}

EmptySegment.propTypes = {
  width: PropTypes.number,
  left: PropTypes.number,
  units: PropTypes.number,
  locale: PropTypes.string
}

EmptySegment.defaultProps = {
  width: 0,
  left: 0
}

function mapStateToProps (state) {
  return {
    units: state.street.units,
    locale: state.locale.locale
  }
}

export default connect(mapStateToProps)(EmptySegment)
