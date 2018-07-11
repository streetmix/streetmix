import { trackEvent } from '../app/event_tracking'
import { loseAnyFocus } from '../util/focus'
import { infoBubble } from '../info_bubble/info_bubble'
import { app } from '../preinit/app_settings'
import { setIgnoreStreetChanges } from '../streets/data_model'
import { getElAbsolutePos } from '../util/helpers'
import { generateRandSeed } from '../util/random'
import {
  SegmentTypes,
  getSegmentInfo,
  getSegmentVariantInfo
} from './info'
import {
  RESIZE_TYPE_INITIAL,
  RESIZE_TYPE_DRAGGING,
  RESIZE_TYPE_PRECISE_DRAGGING,
  MIN_SEGMENT_WIDTH,
  resizeSegment,
  handleSegmentResizeEnd,
  normalizeSegmentWidth,
  cancelFadeoutControls,
  hideControls,
  cancelSegmentResizeTransitions
} from './resizing'
import { getVariantArray, getVariantString } from './variant_utils'
import { TILE_SIZE, DRAGGING_MOVE_HOLE_WIDTH } from './constants'
import { segmentsChanged } from './view'
import store from '../store'
import { addSegment, removeSegment } from '../store/actions/street'
import { clearMenus } from '../store/actions/menus'
import { updateDraggingState, clearDraggingState, setActiveSegment } from '../store/actions/ui'

export const DRAGGING_TYPE_NONE = 0
const DRAGGING_TYPE_CLICK_OR_MOVE = 1
export const DRAGGING_TYPE_MOVE = 2
export const DRAGGING_TYPE_RESIZE = 3

var _draggingType = DRAGGING_TYPE_NONE

export function draggingType () {
  return _draggingType
}

export var draggingResize = {
  segmentEl: null,
  floatingEl: null,
  mouseX: null,
  mouseY: null,
  elX: null,
  elY: null,
  width: null,
  originalX: null,
  originalWidth: null,
  right: false
}

export function changeDraggingType (newDraggingType) {
  _draggingType = newDraggingType

  document.body.classList.remove('segment-move-dragging')
  document.body.classList.remove('segment-resize-dragging')

  switch (_draggingType) {
    case DRAGGING_TYPE_RESIZE:
      document.body.classList.add('segment-resize-dragging')
      break
    case DRAGGING_TYPE_MOVE:
      document.body.classList.add('segment-move-dragging')
      break
  }
}

function handleSegmentResizeStart (event) {
  let x, y
  if (app.readOnly) {
    return
  }

  if (event.touches && event.touches[0]) {
    x = event.touches[0].pageX
    y = event.touches[0].pageY
  } else {
    x = event.pageX
    y = event.pageY
  }

  setIgnoreStreetChanges(true)

  var el = event.target

  changeDraggingType(DRAGGING_TYPE_RESIZE)

  var pos = getElAbsolutePos(el)

  draggingResize.right = el.classList.contains('drag-handle-right')

  draggingResize.floatingEl = document.createElement('div')
  draggingResize.floatingEl.classList.add('drag-handle')
  draggingResize.floatingEl.classList.add('floating')

  if (el.classList.contains('drag-handle-left')) {
    draggingResize.floatingEl.classList.add('drag-handle-left')
  } else {
    draggingResize.floatingEl.classList.add('drag-handle-right')
  }

  draggingResize.floatingEl.style.left = (pos[0] - document.querySelector('#street-section-outer').scrollLeft) + 'px'
  draggingResize.floatingEl.style.top = pos[1] + 'px'
  document.body.appendChild(draggingResize.floatingEl)

  draggingResize.mouseX = x
  draggingResize.mouseY = y

  draggingResize.elX = pos[0]
  draggingResize.elY = pos[1]

  draggingResize.originalX = draggingResize.elX
  draggingResize.originalWidth = parseFloat(el.parentNode.getAttribute('data-width'))
  draggingResize.segmentEl = el.parentNode

  draggingResize.segmentEl.classList.add('hover')

  // todo: refactor
  window.dispatchEvent(new window.CustomEvent('stmx:show_segment_guides', { detail: { dataNo: window.parseInt(draggingResize.segmentEl.dataNo, 10) } }))

  infoBubble.hide()
  infoBubble.hideSegment(true)
  cancelFadeoutControls()
  hideControls()

  window.setTimeout(function () {
    draggingResize.segmentEl.classList.add('hover')
  }, 0)
}

function handleSegmentResizeMove (event) {
  let x, y, resizeType
  if (event.touches && event.touches[0]) {
    x = event.touches[0].pageX
    y = event.touches[0].pageY
  } else {
    x = event.pageX
    y = event.pageY
  }

  var deltaX = x - draggingResize.mouseX

  var deltaFromOriginal = draggingResize.elX - draggingResize.originalX
  if (!draggingResize.right) {
    deltaFromOriginal = -deltaFromOriginal
  }

  draggingResize.elX += deltaX
  draggingResize.floatingEl.style.left = (draggingResize.elX - document.querySelector('#street-section-outer').scrollLeft) + 'px'

  draggingResize.width = draggingResize.originalWidth + (deltaFromOriginal / TILE_SIZE * 2)
  var precise = event.shiftKey

  if (precise) {
    resizeType = RESIZE_TYPE_PRECISE_DRAGGING
  } else {
    resizeType = RESIZE_TYPE_DRAGGING
  }

  resizeSegment(draggingResize.segmentEl.dataNo, resizeType, draggingResize.width, true, false)

  draggingResize.mouseX = x
  draggingResize.mouseY = y
}

export function onBodyMouseDown (event) {
  let topEl, withinMenu
  var el = event.target

  if (app.readOnly || (event.touches && event.touches.length !== 1)) {
    return
  }

  topEl = event.target

  // For street width editing on Firefox

  while (topEl && (topEl.id !== 'street-width')) {
    topEl = topEl.parentNode
  }

  withinMenu = !!topEl

  if (withinMenu) {
    return
  }

  loseAnyFocus()

  topEl = event.target

  while (topEl && (topEl.id !== 'info-bubble') && (topEl.id !== 'street-width') &&
    ((!topEl.classList) ||
    ((!topEl.classList.contains('menu-attached')) &&
    (!topEl.classList.contains('menu'))))) {
    topEl = topEl.parentNode
  }

  withinMenu = !!topEl

  if (withinMenu) {
    return
  }

  store.dispatch(clearMenus())

  if (el.classList.contains('drag-handle')) {
    handleSegmentResizeStart(event)
    event.preventDefault()
  }
}

export function onBodyMouseMove (event) {
  if (_draggingType === DRAGGING_TYPE_NONE) {
    return
  }

  switch (_draggingType) {
    case DRAGGING_TYPE_RESIZE:
      handleSegmentResizeMove(event)
      break
  }

  event.preventDefault()
}

function doDropHeuristics (draggedItem) {
  // Automatically figure out width
  const street = store.getState().street
  const { forPalette, variantString, type, width } = draggedItem
  if (forPalette) {
    if ((street.remainingWidth > 0) &&
      (width > street.remainingWidth * TILE_SIZE)) {
      var segmentMinWidth = getSegmentVariantInfo(type, variantString).minWidth || 0

      if ((street.remainingWidth >= MIN_SEGMENT_WIDTH) &&
        (street.remainingWidth >= segmentMinWidth)) {
        draggedItem.width = normalizeSegmentWidth(street.remainingWidth, RESIZE_TYPE_INITIAL) * TILE_SIZE
      }
    }
  }

  // Automatically figure out variants
  const { segmentBeforeEl, segmentAfterEl } = store.getState().ui.draggingState

  var left = (segmentAfterEl !== undefined) ? street.segments[segmentAfterEl] : null
  var right = (segmentBeforeEl !== undefined) ? street.segments[segmentBeforeEl] : null

  var leftOwner = left && SegmentTypes[getSegmentInfo(left.type).owner]
  var rightOwner = right && SegmentTypes[getSegmentInfo(right.type).owner]

  var leftOwnerAsphalt = (leftOwner === SegmentTypes.CAR) ||
    (leftOwner === SegmentTypes.BIKE) ||
    (leftOwner === SegmentTypes.TRANSIT)
  var rightOwnerAsphalt = (rightOwner === SegmentTypes.CAR) ||
    (rightOwner === SegmentTypes.BIKE) ||
    (rightOwner === SegmentTypes.TRANSIT)

  var leftVariant = left && getVariantArray(left.type, left.variantString)
  var rightVariant = right && getVariantArray(right.type, right.variantString)

  var variant = getVariantArray(type, variantString)
  const segmentInfo = getSegmentInfo(type)

  // Direction

  if (segmentInfo.variants.indexOf('direction') !== -1) {
    if (leftVariant && leftVariant['direction']) {
      variant['direction'] = leftVariant['direction']
    } else if (rightVariant && rightVariant['direction']) {
      variant['direction'] = rightVariant['direction']
    }
  }

  // Parking lane orientation

  if (segmentInfo.variants.indexOf('parking-lane-orientation') !== -1) {
    if (!right || !rightOwnerAsphalt) {
      variant['parking-lane-orientation'] = 'right'
    } else if (!left || !leftOwnerAsphalt) {
      variant['parking-lane-orientation'] = 'left'
    }
  }

  // Parklet orientation

  if (type === 'parklet') {
    if (left && leftOwnerAsphalt) {
      variant['orientation'] = 'right'
    } else if (right && rightOwnerAsphalt) {
      variant['orientation'] = 'left'
    }
  }

  // Turn lane orientation

  if (segmentInfo.variants.indexOf('turn-lane-orientation') !== -1) {
    if (!right || !rightOwnerAsphalt) {
      variant['turn-lane-orientation'] = 'right'
    } else if (!left || !leftOwnerAsphalt) {
      variant['turn-lane-orientation'] = 'left'
    }
  }

  // Transit shelter orientation and elevation

  if (type === 'transit-shelter') {
    if (left && (leftOwner === SegmentTypes.TRANSIT)) {
      variant['orientation'] = 'right'
    } else if (right && (rightOwner === SegmentTypes.TRANSIT)) {
      variant['orientation'] = 'left'
    }
  }

  if (segmentInfo.variants.indexOf('transit-shelter-elevation') !== -1) {
    if (variant['orientation'] === 'right' && left && left.type === 'light-rail') {
      variant['transit-shelter-elevation'] = 'light-rail'
    } else if (variant['orientation'] === 'left' && right && right.type === 'light-rail') {
      variant['transit-shelter-elevation'] = 'light-rail'
    }
  }

  // Bike rack orientation

  if (type === 'sidewalk-bike-rack') {
    if (left && (leftOwner !== SegmentTypes.PEDESTRIAN)) {
      variant['orientation'] = 'left'
    } else if (right && (rightOwner !== SegmentTypes.PEDESTRIAN)) {
      variant['orientation'] = 'right'
    }
  }

  // Lamp orientation

  if (segmentInfo.variants.indexOf('lamp-orientation') !== -1) {
    if (left && right && leftOwnerAsphalt && rightOwnerAsphalt) {
      variant['lamp-orientation'] = 'both'
    } else if (left && leftOwnerAsphalt) {
      variant['lamp-orientation'] = 'left'
    } else if (right && rightOwnerAsphalt) {
      variant['lamp-orientation'] = 'right'
    } else if (left && right) {
      variant['lamp-orientation'] = 'both'
    } else if (left) {
      variant['lamp-orientation'] = 'left'
    } else if (right) {
      variant['lamp-orientation'] = 'right'
    } else {
      variant['lamp-orientation'] = 'both'
    }
  }

  draggedItem.variantString = getVariantString(variant)
}

export function onBodyMouseUp (event) {
  switch (_draggingType) {
    case DRAGGING_TYPE_NONE:
      return
    case DRAGGING_TYPE_CLICK_OR_MOVE:
      changeDraggingType(DRAGGING_TYPE_NONE)
      setIgnoreStreetChanges(false)
      break
    case DRAGGING_TYPE_RESIZE:
      handleSegmentResizeEnd(event)
      break
  }

  event.preventDefault()
}

function handleSegmentDragStart () {
  document.body.classList.add('segment-move-dragging')
  infoBubble.hide()
  cancelFadeoutControls()
  hideControls()
}

export const Types = {
  SEGMENT: 'segment'
}

export const segmentSource = {
  canDrag (props) {
    return !(props.isUnmovable || store.getState().app.readOnly)
  },

  isDragging (props, monitor) {
    return monitor.getItem().dataNo === props.dataNo
  },

  beginDrag (props, monitor, component) {
    handleSegmentDragStart()
    const segmentInfo = getSegmentInfo(props.type)

    return {
      dataNo: (props.forPalette) ? undefined : props.dataNo,
      variantString: (props.forPalette) ? Object.keys(segmentInfo.details).shift() : props.variantString,
      type: props.type,
      randSeed: (props.forPalette && segmentInfo.needRandSeed) ? generateRandSeed() : props.randSeed,
      forPalette: props.forPalette,
      width: (props.forPalette) ? (segmentInfo.defaultWidth * TILE_SIZE) : props.width
    }
  },

  endDrag (props, monitor, component) {
    store.dispatch(clearDraggingState())
    oldDraggingState = null

    if (!monitor.didDrop()) {
      // if no object returned by a drop handler, it is not within the canvas
      if (!props.forPalette) {
        // if existing segment is dropped outside canvas, delete it
        store.dispatch(removeSegment(props.dataNo))
        trackEvent('INTERACTION', 'REMOVE_SEGMENT', 'DRAGGING', null, true)
      }
    }

    cancelSegmentResizeTransitions()
    segmentsChanged(false)
    document.body.classList.remove('segment-move-dragging')
  }
}

export function collectDragSource (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}

/**
 * Calculates the additional space needed before/after a segment during dragging
 *
 * @param {Number} dataNo - position of the current segment whose segment position
 *    is being calculated
 * @param {Object} draggingState - includes the positions of the segment the dragged
 *    segment is after (segmentAfterEl) and the segment the dragged segment is before
 *    (segmentBeforeEl), and undefined if it does not have one
 *
 */
export function makeSpaceBetweenSegments (dataNo, draggingState) {
  const { segmentBeforeEl, segmentAfterEl, draggedSegment } = draggingState
  const { segments } = store.getState().street

  let spaceBetweenSegments = 0
  let extraSpace = (dataNo === draggedSegment) ? (segments[dataNo].width * TILE_SIZE) : 0

  if (dataNo >= segmentBeforeEl) {
    spaceBetweenSegments += DRAGGING_MOVE_HOLE_WIDTH

    if (segmentAfterEl === undefined) {
      spaceBetweenSegments += DRAGGING_MOVE_HOLE_WIDTH
    }
  }

  if (dataNo > segmentAfterEl) {
    spaceBetweenSegments += DRAGGING_MOVE_HOLE_WIDTH

    if (segmentBeforeEl === undefined) {
      spaceBetweenSegments += DRAGGING_MOVE_HOLE_WIDTH
    }
  }

  // Originally, the dragged segment gets moved over to the same position as the segment
  // next to it. This causes react-dnd's hover method to assume it is hovering over the
  // dragged segment which leads to a constant change of dragging state and the constant
  // back and forth movement of the segment next to the dragged segment. In order to fix
  // this problem, depending on where the user is hovering in comparison to the dragged
  // segment, we are either moving the dragged segment more to the right or to the left.
  if (dataNo === draggedSegment) {
    extraSpace = (draggedSegment > segmentAfterEl || segmentAfterEl === undefined) ? extraSpace : -extraSpace
  }

  return spaceBetweenSegments + extraSpace
}

let oldDraggingState = store.getState().ui.draggingState

// Checks to see if Redux dragging state needs to be updated, and if so, dispatches action.
// This prevents a constant dispatch of the updateDraggingState action which causes the
// dragging of the segment to be laggy and choppy.

function updateIfDraggingStateChanged (segmentBeforeEl, segmentAfterEl, draggedItem) {
  let changed = false

  if (oldDraggingState) {
    changed = (segmentBeforeEl !== oldDraggingState.segmentBeforeEl ||
      segmentAfterEl !== oldDraggingState.segmentAfterEl ||
      draggedItem.dataNo !== oldDraggingState.draggedSegment)
  } else {
    changed = true
  }

  if (changed) {
    oldDraggingState = {
      segmentBeforeEl,
      segmentAfterEl,
      draggedSegment: draggedItem.dataNo
    }

    store.dispatch(updateDraggingState(segmentBeforeEl, segmentAfterEl, draggedItem.dataNo))
    doDropHeuristics(draggedItem)
  }

  return changed
}

export const segmentTarget = {
  canDrop (props, monitor) {
    return !(props.forPalette)
  },

  hover (props, monitor, component) {
    if (!monitor.canDrop()) return

    const dragIndex = monitor.getItem().dataNo
    const hoverIndex = props.dataNo

    const hoveredSegment = component.getDecoratedComponentInstance().streetSegment
    const { left } = hoveredSegment.getBoundingClientRect()
    const hoverMiddleX = Math.round(left + (props.width) / 2)
    const { x } = monitor.getClientOffset()

    if (dragIndex === hoverIndex) {
      updateIfDraggingStateChanged(dragIndex, undefined, monitor.getItem())
    } else {
      const { segments } = store.getState().street

      const segmentBeforeEl = (x > hoverMiddleX && hoverIndex !== segments.length - 1) ? hoverIndex + 1
        : (hoverIndex === segments.length - 1) ? undefined
          : hoverIndex

      const segmentAfterEl = (x > hoverMiddleX && hoverIndex !== 0) ? hoverIndex
        : (hoverIndex === 0) ? undefined
          : hoverIndex - 1

      updateIfDraggingStateChanged(segmentBeforeEl, segmentAfterEl, monitor.getItem())
    }
  }
}

function handleSegmentCanvasDrop (draggedItem) {
  const { segmentBeforeEl, segmentAfterEl, draggedSegment } = store.getState().ui.draggingState

  store.dispatch(clearDraggingState())
  // If dropped in same position as dragged segment was before, return
  if (segmentBeforeEl === draggedSegment && segmentAfterEl === undefined) {
    store.dispatch(setActiveSegment(draggedSegment))
    return
  }

  const newSegment = {
    variantString: draggedItem.variantString,
    width: draggedItem.width / TILE_SIZE,
    type: draggedItem.type,
    randSeed: draggedItem.randSeed
  }

  let newIndex = (segmentAfterEl !== undefined) ? (segmentAfterEl + 1) : segmentBeforeEl

  if (!draggedItem.forPalette) {
    store.dispatch(removeSegment(draggedSegment))
    newIndex = (newIndex <= draggedSegment) ? newIndex : newIndex - 1
  }

  store.dispatch(addSegment(newIndex, newSegment))
  store.dispatch(setActiveSegment(newIndex))
}

/**
 * Determines if segment was dropped/hovered on left or right side of street
 *
 * @param {Node} segment - reference to StreetEditable
 * @param {Number} droppedPosition - x position of dropped segment in reference
 *    to StreetEditable
 * @returns {string} - left, right, or null if dropped/hovered over a segment
 */
function isOverLeftOrRightCanvas (segment, droppedPosition) {
  const { remainingWidth } = store.getState().street
  const { left, right } = segment.getBoundingClientRect()

  const emptySegmentWidth = (remainingWidth * TILE_SIZE) / 2

  return (droppedPosition < left + emptySegmentWidth) ? 'left'
    : (droppedPosition > right - emptySegmentWidth) ? 'right'
      : null
}

export const canvasTarget = {
  hover (props, monitor, component) {
    if (!monitor.canDrop()) return

    if (monitor.isOver({shallow: true})) {
      const position = isOverLeftOrRightCanvas(component.streetSectionEditable, monitor.getClientOffset().x)

      if (!position) return

      const { segments } = store.getState().street
      const segmentBeforeEl = (position === 'left') ? 0 : undefined
      const segmentAfterEl = (position === 'left') ? undefined : segments.length - 1

      updateIfDraggingStateChanged(segmentBeforeEl, segmentAfterEl, monitor.getItem())
    }
  },

  drop (props, monitor, component) {
    const draggedItem = monitor.getItem()
    handleSegmentCanvasDrop(draggedItem)

    return { withinCanvas: true }
  }
}

export function collectDropTarget (connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true })
  }
}
