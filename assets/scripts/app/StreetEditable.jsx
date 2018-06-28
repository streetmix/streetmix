import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Segment from '../segments/Segment'
import uuid from 'uuid'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { TILE_SIZE } from '../segments/constants'
import { getVariantArray } from '../segments/variant_utils'
import { cancelSegmentResizeTransitions } from '../segments/resizing'
import { Types, canvasTarget, collectDropTarget } from '../segments/drag_and_drop'
import { DropTarget } from 'react-dnd'
import flow from 'lodash/flow'

class StreetEditable extends React.Component {
  static propTypes = {
    onResized: PropTypes.bool.isRequired,
    setBuildingWidth: PropTypes.func.isRequired,
    street: PropTypes.object.isRequired,
    updatePerspective: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func,
    draggingState: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      suppressMouseEnter: false
    }
  }

  componentDidUpdate (prevProps) {
    const { onResized } = this.props

    if (onResized && prevProps.onResized !== onResized) {
      this.props.setBuildingWidth(this.streetSectionEditable)
    }

    if (prevProps.street.id !== this.props.street.id || prevProps.street.width !== this.props.street.width) {
      cancelSegmentResizeTransitions()
    }
  }

  updateSegmentData = (ref, dataNo, segmentPos) => {
    const { segments } = this.props.street
    const segment = segments[dataNo]

    if (segment) {
      segment.el = ref
      segment.el.dataNo = dataNo
      segment.el.savedLeft = Math.round(segmentPos)
      segment.el.savedNoMoveLeft = Math.round(segmentPos)
      segment.el.cssTransformLeft = Math.round(segmentPos)
      segment.el.savedWidth = Math.round(segment.width * TILE_SIZE)
    }
  }

  switchSegmentAway = (el) => {
    el.classList.add('create')
    el.style.left = el.savedLeft + 'px'

    this.props.updatePerspective(el)
    this.setState({ suppressMouseEnter: true })
  }

  calculateSegmentPos = (dataNo) => {
    const { segments, remainingWidth } = this.props.street
    const { draggingState } = this.props
    const DRAGGING_MOVE_HOLE_WIDTH = 80

    let currPos = 0

    for (let i = 0; i < dataNo; i++) {
      if (draggingState && draggingState.hoveredSegment === i) {
        currPos += DRAGGING_MOVE_HOLE_WIDTH
      } else {
        currPos += segments[i].width * TILE_SIZE
      }
    }

    let mainLeft = remainingWidth * TILE_SIZE
    if (draggingState) {
      const { fromPalette, draggedSegment } = draggingState

      const draggedWidth = (fromPalette) ? 0 : (segments[draggedSegment].width * TILE_SIZE)
      mainLeft += draggedWidth
      mainLeft -= DRAGGING_MOVE_HOLE_WIDTH
    }

    mainLeft = mainLeft / 2
    const segmentPos = mainLeft + currPos
    return segmentPos
  }

  handleExitAnimations = (child) => {
    return React.cloneElement(child, {
      exit: !(this.props.street.immediateRemoval)
    })
  }

  renderStreetSegments = () => {
    const { segments, units, immediateRemoval } = this.props.street

    return segments.map((segment, i) => {
      const segmentWidth = (segment.width * TILE_SIZE)
      const segmentPos = this.calculateSegmentPos(i)

      segment.variant = getVariantArray(segment.type, segment.variantString)
      segment.warnings = (segment.warnings) || []

      if (!segment.id) {
        segment.id = uuid()
      }

      const segmentEl = (
        <CSSTransition
          key={segment.id}
          timeout={250}
          classNames="switching-away"
          exit={!(immediateRemoval)}
          onExit={this.switchSegmentAway}
          onExited={() => { this.setState({ suppressMouseEnter: false }) }}
          unmountOnExit
        >
          <Segment
            key={segment.id}
            dataNo={i}
            type={segment.type}
            variantString={segment.variantString}
            width={segmentWidth}
            isUnmovable={false}
            forPalette={false}
            units={units}
            randSeed={segment.randSeed}
            segmentPos={segmentPos}
            suppressMouseEnter={this.state.suppressMouseEnter}
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
      width: (this.props.street.width * TILE_SIZE) + 'px'
    }

    return connectDropTarget(
      <div
        id="street-section-editable"
        key={this.props.street.id}
        style={style}
        ref={(ref) => { this.streetSectionEditable = ref }}
      >
        <TransitionGroup key={this.props.street.id} component={null} enter={false} childFactory={this.handleExitAnimations}>
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
  DropTarget(Types.SEGMENT, canvasTarget, collectDropTarget),
  connect(mapStateToProps)
)(StreetEditable)
