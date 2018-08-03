import React from 'react'
import PropTypes from 'prop-types'
import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { DragTypes } from './constants'
import store from '../store'
import { updateResizeDragState } from '../store/actions/ui'

const dragSpec = {
  beginDrag (props, monitor, component) {
    store.dispatch(updateResizeDragState(true))

    return {
      position: props.position
    }
  },

  endDrag (props, monitor, component) {
    store.dispatch(updateResizeDragState(false))
  }
}

function dragCollect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview()
  }
}

export class ResizeHandle extends React.Component {
  static propTypes = {
    // Provided by parent
    side: PropTypes.oneOf(['left', 'right']).isRequired,
    width: PropTypes.number.isRequired,
    show: PropTypes.bool,
    suppress: PropTypes.bool,

    // Provided by react-dnd DragSource and DropTarget
    connectDragSource: PropTypes.func,
    connectDragPreview: PropTypes.func
  }

  static defaultProps = {
    show: false,
    suppress: false
  }

  componentDidMount = () => {
    this.props.connectDragPreview(getEmptyImage(), { captureDraggingState: true })
  }

  render () {
    // To prevent drag handles from overlapping each other when the segment widths are very small,
    // we calculate an X-position adjustment when the value of `width` is less than 60px.
    // The X position adjustment follows the linear equation y = 0.5x - 35 (where `x` is `width`).
    // For example:
    //    width = 36 ==> adjustX = -11px
    //    width = 12 ==> adjustX = -29px
    // When no adjustment is needed, this value is `null` so that no adjustment value will be
    // applied to the `style` attribute.
    const adjustX = (this.props.width < 60) ? `${(0.5 * this.props.width) - 35}px` : null

    let classNames, icon
    let styles = {}

    // Sets side-specific appearances
    if (this.props.side === 'left') {
      classNames = 'drag-handle drag-handle-left'
      icon = '‹'

      // If `adjustX` is null, this will not be applied.
      styles.left = adjustX
    } else {
      classNames = 'drag-handle drag-handle-right'
      icon = '›'

      // If `adjustX` is null, this will not be applied.
      styles.right = adjustX
    }

    // When shown, CSS transitions the handle into view.
    if (this.props.show) {
      classNames += ' drag-handle-show'
    }

    // If suppressed by other UI, instantly hide this from view, no transition.
    if (this.props.suppress) {
      styles.display = 'none'
    }

    return this.props.connectDragSource(
      <span className={classNames} style={styles}>
        {icon}
      </span>
    )
  }
}

export default DragSource(DragTypes.SEGMENT_DRAG_HANDLE, dragSpec, dragCollect)(ResizeHandle)
