import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT } from '../ui/icons'
import './SegmentDragHandles.scss'

function SegmentDragHandles (props) {
  const display = (props.visible) ? null : 'none'

  // To prevent drag handles from overlapping each other when the segment widths are very small,
  // we calculate an X-position adjustment when the value of `width` is less than 60px.
  // The X position adjustment follows the linear equation y = 0.5x - 35 (where `x` is `width`).
  // For example:
  //    width = 36 ==> adjustX = -11px
  //    width = 12 ==> adjustX = -29px
  const adjustX = (props.width < 60)
    ? `${(0.5 * props.width) - 35}px` : null

  let leftClassNames = 'drag-handle drag-handle-left'
  let rightClassNames = 'drag-handle drag-handle-right'
  if (props.visible) {
    leftClassNames += ' drag-handle-visible'
    rightClassNames += ' drag-handle-visible'
  }

  return (
    <React.Fragment>
      <span className={leftClassNames} style={{ display, left: adjustX }}>
        <FontAwesomeIcon icon={ICON_CHEVRON_LEFT} />
      </span>
      <span className={rightClassNames} style={{ display, right: adjustX }}>
        <FontAwesomeIcon icon={ICON_CHEVRON_RIGHT} />
      </span>
    </React.Fragment>
  )
}

SegmentDragHandles.propTypes = {
  width: PropTypes.number,
  visible: PropTypes.bool
}

SegmentDragHandles.defaultProps = {
  visible: false
}

export default SegmentDragHandles
