import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { DropTarget } from 'react-dnd'
import flow from 'lodash/flow'
import StreetEditablePresentation from './StreetEditablePresentation'
import { TILE_SIZE, DRAGGING_MOVE_HOLE_WIDTH } from '../segments/constants'
import { cancelSegmentResizeTransitions } from '../segments/resizing'
import {
  Types,
  canvasTarget,
  collectDropTarget,
  makeSpaceBetweenSegments,
  isSegmentWithinCanvas,
  DRAGGING_TYPE_RESIZE
} from '../segments/drag_and_drop'

class StreetEditableContainer extends React.Component {
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

  constructor (props) {
    super(props)

    this.state = {
      withinCanvas: null
    }
  }

  componentDidMount () {
    this.props.setBuildingWidth(this.streetSectionEditable)
  }

  componentDidUpdate (prevProps) {
    const { resizeType, draggingState } = this.props

    if ((resizeType && !prevProps.resizeType) ||
        (prevProps.draggingType === DRAGGING_TYPE_RESIZE && !this.props.draggingType)) {
      this.props.setBuildingWidth(this.streetSectionEditable)
    }

    if (prevProps.street.id !== this.props.street.id || prevProps.street.width !== this.props.street.width) {
      cancelSegmentResizeTransitions()
    }

    const dragEvents = ['dragover', 'touchmove']
    if (!prevProps.draggingState && draggingState) {
      dragEvents.map((type) => { window.addEventListener(type, this.updateWithinCanvas) })
    } else if (prevProps.draggingState && !draggingState) {
      dragEvents.map((type) => { window.removeEventListener(type, this.updateWithinCanvas) })
    }
  }

  updateWithinCanvas = (event) => {
    const withinCanvas = isSegmentWithinCanvas(event, this.streetSectionEditable)
    if (withinCanvas) {
      document.body.classList.remove('not-within-canvas')
    } else {
      document.body.classList.add('not-within-canvas')
    }

    if (this.state.withinCanvas !== withinCanvas) {
      this.setState({ withinCanvas })
    }
  }

  calculateSegmentPos = (dataNo) => {
    const { segments, remainingWidth } = this.props.street
    const { draggingState } = this.props

    let currPos = 0

    for (let i = 0; i < dataNo; i++) {
      const width = (draggingState && draggingState.draggedSegment === i) ? 0 : segments[i].width * TILE_SIZE
      currPos += width
    }

    let mainLeft = remainingWidth
    if (draggingState && segments[draggingState.draggedSegment] !== undefined) {
      const draggedWidth = segments[draggingState.draggedSegment].width || 0
      mainLeft += draggedWidth
    }

    mainLeft = (mainLeft * TILE_SIZE) / 2

    if (draggingState && this.state.withinCanvas) {
      mainLeft -= DRAGGING_MOVE_HOLE_WIDTH
      const spaceBetweenSegments = makeSpaceBetweenSegments(dataNo, draggingState)
      return Math.round(mainLeft + currPos + spaceBetweenSegments)
    } else {
      return Math.round(mainLeft + currPos)
    }
  }

  render () {
    const { connectDropTarget } = this.props
    const style = {
      width: (this.props.street.width * TILE_SIZE) + 'px'
    }

    return connectDropTarget(
      <div
        key={this.props.street.id}
        id="street-section-editable"
        style={style}
        ref={(ref) => { this.streetSectionEditable = ref }}
      >
        <StreetEditablePresentation
          street={this.props.street}
          updatePerspective={this.props.updatePerspective}
          calculateSegmentPos={this.calculateSegmentPos}
        />
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
  DropTarget([Types.SEGMENT, Types.PALETTE_SEGMENT], canvasTarget, collectDropTarget),
  connect(mapStateToProps)
)(StreetEditableContainer)
