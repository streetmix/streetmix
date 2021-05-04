import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { TILE_SIZE } from '../segments/constants'
import SegmentLabelContainer from './SegmentLabelContainer'
import './EmptySegment.scss'

/**
 * This is a "presentational" component in the React presentational/container
 * component pattern. Its "container" (parent) component, <EmptySegmentContainer />,
 * determines and passes the `width` and `left` props to this component.
 */
EmptySegment.propTypes = {
  width: PropTypes.number,
  left: PropTypes.number
}

function EmptySegment ({ width = 0, left = 0 }) {
  const units = useSelector((state) => state.street.units)
  const locale = useSelector((state) => state.locale.locale)

  // Do not render if width is a negative number
  if (width <= 0) return null

  // Inline style specifies size and position
  // `width` and `left` are provided as real-world measurements. This is
  // multiplied by TILE_SIZE to get the pixel dimension and offset.
  const style = {
    width: width * TILE_SIZE + 'px',
    left: left * TILE_SIZE + 'px'
  }

  return (
    <div className="segment segment-empty" style={style}>
      <SegmentLabelContainer
        label={
          <FormattedMessage id="section.empty" defaultMessage="Empty space" />
        }
        width={width}
        units={units}
        locale={locale}
      />
    </div>
  )
}

export default EmptySegment
