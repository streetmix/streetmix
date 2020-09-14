import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { DropTarget } from 'react-dnd'
import flow from 'lodash/flow'
import Segment from '../segments/Segment'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import {
  TILE_SIZE,
  DRAGGING_MOVE_HOLE_WIDTH,
  DRAGGING_TYPE_RESIZE
} from '../segments/constants'
import { cancelSegmentResizeTransitions } from '../segments/resizing'
import {
  Types,
  canvasTarget,
  collectDropTarget,
  makeSpaceBetweenSegments,
  isSegmentWithinCanvas
} from '../segments/drag_and_drop'

export class StreetEditable extends React.Component {
  static propTypes = {
    // Provided by parent
    resizeType: PropTypes.number,
    setBuildingWidth: PropTypes.func.isRequired,
    updatePerspective: PropTypes.func.isRequired,
    draggingType: PropTypes.number,

    // Provided by store
    street: PropTypes.object.isRequired,
    draggingState: PropTypes.object,

    // Provided by DropTarget
    connectDropTarget: PropTypes.func
  }

  // Internal "state", but does not affect renders, so it is not React state
  withinCanvas = null

  // Placeholder for a ref.
  // TODO: Upgrade to createRef(), but this is currently broken when placed on
  // an element inside of react-dnd's `connectDragSource`.
  // Info: https://github.com/react-dnd/react-dnd/issues/998
  streetSectionEditable = null

  componentDidMount () {
    this.props.setBuildingWidth(this.streetSectionEditable)
  }

  componentDidUpdate (prevProps) {
    const { resizeType, draggingState } = this.props

    if (
      (resizeType && !prevProps.resizeType) ||
      (prevProps.draggingType === DRAGGING_TYPE_RESIZE &&
        !this.props.draggingType)
    ) {
      this.props.setBuildingWidth(this.streetSectionEditable)
    }

    if (
      prevProps.street.id !== this.props.street.id ||
      prevProps.street.width !== this.props.street.width
    ) {
      cancelSegmentResizeTransitions()
    }

    const dragEvents = ['dragover', 'touchmove']
    if (!prevProps.draggingState && draggingState) {
      dragEvents.map((type) => {
        window.addEventListener(type, this.updateWithinCanvas)
      })
    } else if (prevProps.draggingState && !draggingState) {
      dragEvents.map((type) => {
        window.removeEventListener(type, this.updateWithinCanvas)
      })
    }
  }

  updateWithinCanvas = (event) => {
    const withinCanvas = isSegmentWithinCanvas(
      event,
      this.streetSectionEditable
    )

    if (withinCanvas) {
      document.body.classList.remove('not-within-canvas')
    } else {
      document.body.classList.add('not-within-canvas')
    }

    if (this.withinCanvas !== withinCanvas) {
      this.withinCanvas = withinCanvas
    }
  }

  updateSegmentData = (ref, dataNo, segmentPos) => {
    const { segments } = this.props.street
    const segment = segments[dataNo]

    if (segment) {
      ref.dataNo = dataNo
      ref.savedLeft = Math.round(segmentPos)
      ref.cssTransformLeft = Math.round(segmentPos)
    }
  }

  handleSwitchSegmentAway = (el) => {
    el.classList.add('create')
    el.style.left = el.savedLeft + 'px'

    this.props.updatePerspective(el)
  }

  calculateSegmentPos = (dataNo) => {
    const { segments, remainingWidth } = this.props.street
    const { draggingState } = this.props

    let currPos = 0

    for (let i = 0; i < dataNo; i++) {
      const width =
        draggingState && draggingState.draggedSegment === i
          ? 0
          : segments[i].width * TILE_SIZE
      currPos += width
    }

    let mainLeft = remainingWidth
    if (draggingState && segments[draggingState.draggedSegment] !== undefined) {
      const draggedWidth = segments[draggingState.draggedSegment].width || 0
      mainLeft += draggedWidth
    }

    mainLeft = (mainLeft * TILE_SIZE) / 2

    if (draggingState && this.withinCanvas) {
      mainLeft -= DRAGGING_MOVE_HOLE_WIDTH
      const spaceBetweenSegments = makeSpaceBetweenSegments(
        dataNo,
        draggingState
      )
      return mainLeft + currPos + spaceBetweenSegments
    } else {
      return mainLeft + currPos
    }
  }

  onExitAnimations = (child) => {
    return React.cloneElement(child, {
      exit: !this.props.street.immediateRemoval
    })
  }

  renderStreetSegments = () => {
    const { segments, units, immediateRemoval } = this.props.street
    const streetId = this.props.street.id

    return segments.map((segment, i) => {
      const segmentPos = this.calculateSegmentPos(i)

      const segmentEl = (
        <CSSTransition
          key={`${streetId}.${segment.id}`}
          timeout={250}
          classNames="switching-away"
          exit={!immediateRemoval}
          onExit={this.handleSwitchSegmentAway}
          unmountOnExit={true}
        >
          <Segment
            dataNo={i}
            segment={{ ...segment }}
            actualWidth={segment.width}
            units={units}
            segmentPos={segmentPos}
            updateSegmentData={this.updateSegmentData}
            updatePerspective={this.props.updatePerspective}
          />
        </CSSTransition>
      )

      return segmentEl
    })
  }

  render () {
    const { connectDropTarget } = this.props
    const style = {
      width: this.props.street.width * TILE_SIZE + 'px'
    }

    return connectDropTarget(
      <div
        id="street-section-editable"
        key={this.props.street.id}
        style={style}
        ref={(ref) => {
          this.streetSectionEditable = ref
        }}
      >
        <TransitionGroup
          key={this.props.street.id}
          component={null}
          enter={false}
          childFactory={this.onExitAnimations}
        >
          {this.renderStreetSegments()}
        </TransitionGroup>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    street: state.street,
    draggingState: state.ui.draggingState
  }
}

export default flow(
  DropTarget(
    [Types.SEGMENT, Types.PALETTE_SEGMENT],
    canvasTarget,
    collectDropTarget
  ),
  connect(mapStateToProps)
)(StreetEditable)
