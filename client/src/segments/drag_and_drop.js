import { nanoid } from 'nanoid'
import { infoBubble } from '../info_bubble/info_bubble'
import { app } from '../preinit/app_settings'
import { setIgnoreStreetChanges } from '../streets/data_model'
import { getElAbsolutePos } from '../util/helpers'
import store, { observeStore } from '../store'
import { addSegment, removeSegment, moveSegment } from '../store/slices/street'
import {
  initDraggingState,
  updateDraggingState,
  clearDraggingState,
  setActiveSegment,
  setDraggingType
} from '../store/slices/ui'
import { generateRandSeed } from '../util/random'
import { getWidthInMetric } from '../util/width_units'
import { SegmentTypes, getSegmentInfo, getSegmentVariantInfo } from './info'
import {
  RESIZE_TYPE_INITIAL,
  RESIZE_TYPE_DRAGGING,
  RESIZE_TYPE_PRECISE_DRAGGING,
  resizeSegment,
  handleSegmentResizeEnd,
  resolutionForResizeType,
  normalizeSegmentWidth,
  hideControls,
  cancelSegmentResizeTransitions
} from './resizing'
import { getVariantArray, getVariantString } from './variant_utils'
import {
  TILE_SIZE,
  MIN_SEGMENT_WIDTH,
  DRAGGING_MOVE_HOLE_WIDTH,
  DRAGGING_TYPE_NONE,
  DRAGGING_TYPE_MOVE,
  DRAGGING_TYPE_RESIZE
} from './constants'
import { segmentsChanged } from './view'

export const draggingResize = {
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

export function initDragTypeSubscriber () {
  const select = (state) => state.ui.draggingType

  const onChange = (draggingType) => {
    document.body.classList.remove('segment-move-dragging')
    document.body.classList.remove('segment-resize-dragging')

    switch (draggingType) {
      case DRAGGING_TYPE_RESIZE:
        document.body.classList.add('segment-resize-dragging')
        break
      case DRAGGING_TYPE_MOVE:
        document.body.classList.add('segment-move-dragging')
        break
    }
  }

  return observeStore(select, onChange)
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

  const el = event.target.closest('.drag-handle')

  store.dispatch(setDraggingType(DRAGGING_TYPE_RESIZE))

  const pos = getElAbsolutePos(el)

  draggingResize.right = el.classList.contains('drag-handle-right')

  draggingResize.floatingEl = document.createElement('div')
  draggingResize.floatingEl.classList.add('drag-handle')
  draggingResize.floatingEl.classList.add('floating')

  if (el.classList.contains('drag-handle-left')) {
    draggingResize.floatingEl.classList.add('drag-handle-left')
  } else {
    draggingResize.floatingEl.classList.add('drag-handle-right')
  }

  draggingResize.floatingEl.style.left =
    pos[0] - document.querySelector('#street-section-outer').scrollLeft + 'px'
  draggingResize.floatingEl.style.top = pos[1] + 'px'
  document.body.appendChild(draggingResize.floatingEl)

  draggingResize.mouseX = x
  draggingResize.mouseY = y

  draggingResize.elX = pos[0]
  draggingResize.elY = pos[1]

  draggingResize.originalX = draggingResize.elX
  const sliceIndex = Number(el.parentNode.dataset.sliceIndex)
  draggingResize.originalWidth =
    store.getState().street.segments[sliceIndex].width
  draggingResize.segmentEl = el.parentNode

  draggingResize.segmentEl.classList.add('hover')

  infoBubble.hide()
  infoBubble.hideSegment(true)
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

  const deltaX = x - draggingResize.mouseX

  let deltaFromOriginal = draggingResize.elX - draggingResize.originalX
  if (!draggingResize.right) {
    deltaFromOriginal = -deltaFromOriginal
  }

  draggingResize.width =
    draggingResize.originalWidth + (deltaFromOriginal / TILE_SIZE) * 2
  draggingResize.elX += deltaX
  draggingResize.floatingEl.style.left =
    draggingResize.elX -
    document.querySelector('#street-section-outer').scrollLeft +
    'px'

  const precise = event.shiftKey

  if (precise) {
    resizeType = RESIZE_TYPE_PRECISE_DRAGGING
  } else {
    resizeType = RESIZE_TYPE_DRAGGING
  }

  draggingResize.width = resizeSegment(
    Number(draggingResize.segmentEl.dataset.sliceIndex),
    resizeType,
    draggingResize.width
  )

  draggingResize.mouseX = x
  draggingResize.mouseY = y
}

export function onBodyMouseDown (event) {
  if (app.readOnly || (event.touches && event.touches.length !== 1)) {
    return
  }

  if (event.target.closest('.drag-handle')) {
    handleSegmentResizeStart(event)
    event.preventDefault()
  }
}

export function isSegmentWithinCanvas (event, canvasEl) {
  const { remainingWidth } = store.getState().street

  let x, y
  if (event.touches && event.touches[0]) {
    x = event.touches[0].pageX
    y = event.touches[0].pageY
  } else {
    x = event.x
    y = event.y
  }

  const { top, bottom, left, right } = canvasEl.getBoundingClientRect()

  const withinCanvasY = y >= top && y <= bottom
  let withinCanvasX = x >= left && x <= right

  if (!withinCanvasX && remainingWidth < 0) {
    const margin = (remainingWidth * TILE_SIZE) / 2
    const newLeft = left + margin - DRAGGING_MOVE_HOLE_WIDTH
    const newRight = right - margin + DRAGGING_MOVE_HOLE_WIDTH

    withinCanvasX = x >= newLeft && x <= newRight
  }

  const withinCanvas = withinCanvasX && withinCanvasY

  if (oldDraggingState) {
    oldDraggingState.withinCanvas = withinCanvas
  }

  return withinCanvas
}

export function onBodyMouseMove (event) {
  const { draggingType } = store.getState().ui

  if (draggingType === DRAGGING_TYPE_NONE) {
    return
  } else if (draggingType === DRAGGING_TYPE_RESIZE) {
    handleSegmentResizeMove(event)
  }

  event.preventDefault()
}

function doDropHeuristics (draggedItem, draggedItemType) {
  // Automatically figure out width
  const street = store.getState().street
  const { variantString, type, actualWidth } = draggedItem

  if (draggedItemType === Types.PALETTE) {
    if (street.remainingWidth > 0 && actualWidth > street.remainingWidth) {
      const segmentMinWidth =
        getWidthInMetric(
          getSegmentVariantInfo(type, variantString).minWidth,
          street.units
        ) ?? 0

      if (
        street.remainingWidth >= MIN_SEGMENT_WIDTH &&
        street.remainingWidth >= segmentMinWidth
      ) {
        draggedItem.actualWidth = normalizeSegmentWidth(
          street.remainingWidth,
          resolutionForResizeType(RESIZE_TYPE_INITIAL, street.units)
        )
      }
    }
  }

  // Automatically figure out variants
  const { segmentBeforeEl, segmentAfterEl } = store.getState().ui.draggingState

  const left =
    segmentAfterEl !== undefined ? street.segments[segmentAfterEl] : null
  const right =
    segmentBeforeEl !== undefined ? street.segments[segmentBeforeEl] : null

  const leftOwner = left && SegmentTypes[getSegmentInfo(left.type).owner]
  const rightOwner = right && SegmentTypes[getSegmentInfo(right.type).owner]

  const leftOwnerAsphalt =
    leftOwner === SegmentTypes.CAR ||
    leftOwner === SegmentTypes.BIKE ||
    leftOwner === SegmentTypes.TRANSIT
  const rightOwnerAsphalt =
    rightOwner === SegmentTypes.CAR ||
    rightOwner === SegmentTypes.BIKE ||
    rightOwner === SegmentTypes.TRANSIT

  const leftVariant = left && getVariantArray(left.type, left.variantString)
  const rightVariant = right && getVariantArray(right.type, right.variantString)

  const variant = getVariantArray(type, variantString)
  const segmentInfo = getSegmentInfo(type)

  // Direction

  if (segmentInfo.variants.indexOf('direction') !== -1) {
    if (leftVariant && leftVariant.direction) {
      variant.direction = leftVariant.direction
    } else if (rightVariant && rightVariant.direction) {
      variant.direction = rightVariant.direction
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
      variant.orientation = 'right'
    } else if (right && rightOwnerAsphalt) {
      variant.orientation = 'left'
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
    if (left && leftOwner === SegmentTypes.TRANSIT) {
      variant.orientation = 'right'
    } else if (right && rightOwner === SegmentTypes.TRANSIT) {
      variant.orientation = 'left'
    }
  }

  if (segmentInfo.variants.indexOf('transit-shelter-elevation') !== -1) {
    if (variant.orientation === 'right' && left && left.type === 'light-rail') {
      variant['transit-shelter-elevation'] = 'light-rail'
    } else if (
      variant.orientation === 'left' &&
      right &&
      right.type === 'light-rail'
    ) {
      variant['transit-shelter-elevation'] = 'light-rail'
    }
  }

  // BRT station orientation

  if (type === 'brt-station') {
    // Default orientation is center
    variant['brt-station-orientation'] = 'center'
    if (left && leftOwner === SegmentTypes.TRANSIT) {
      variant['brt-station-orientation'] = 'right'
    } else if (right && rightOwner === SegmentTypes.TRANSIT) {
      variant['brt-station-orientation'] = 'left'
    }
  }

  // Bike rack orientation

  if (type === 'sidewalk-bike-rack') {
    if (left && leftOwner !== SegmentTypes.PEDESTRIAN) {
      variant.orientation = 'left'
    } else if (right && rightOwner !== SegmentTypes.PEDESTRIAN) {
      variant.orientation = 'right'
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
  const { draggingType } = store.getState().ui

  switch (draggingType) {
    case DRAGGING_TYPE_NONE:
      return
    case DRAGGING_TYPE_RESIZE:
      handleSegmentResizeEnd(event)
      break
  }

  event.preventDefault()
}

function handleSegmentDragStart () {
  infoBubble.hide()
  hideControls()
}

function handleSegmentDragEnd () {
  oldDraggingState = null
  cancelSegmentResizeTransitions()
  segmentsChanged(false)

  document.body.classList.remove('not-within-canvas')
}

let oldDraggingState

// Checks to see if Redux dragging state needs to be updated, and if so, dispatches action.
// This prevents a constant dispatch of the updateDraggingState action which causes the
// dragging of the segment to be laggy and choppy.

function updateIfDraggingStateChanged (
  segmentBeforeEl,
  segmentAfterEl,
  draggedItem,
  draggedItemType
) {
  let changed = false

  if (oldDraggingState) {
    changed =
      segmentBeforeEl !== oldDraggingState.segmentBeforeEl ||
      segmentAfterEl !== oldDraggingState.segmentAfterEl ||
      draggedItem.sliceIndex !== oldDraggingState.draggedSegment
  } else {
    changed = true
  }

  if (changed) {
    oldDraggingState = {
      segmentBeforeEl,
      segmentAfterEl,
      draggedSegment: draggedItem.sliceIndex
    }

    store.dispatch(
      updateDraggingState({
        segmentBeforeEl,
        segmentAfterEl,
        draggedSegment: draggedItem.sliceIndex
      })
    )
    doDropHeuristics(draggedItem, draggedItemType)
  }

  return changed
}

function handleSegmentCanvasDrop (draggedItem, type) {
  // `oldDraggingState` can be `null` or undefined, if so, bail
  if (!oldDraggingState) return

  const { segmentBeforeEl, segmentAfterEl, draggedSegment } = oldDraggingState

  // If dropped in same position as dragged segment was before, return
  if (segmentBeforeEl === draggedSegment && segmentAfterEl === undefined) {
    store.dispatch(setActiveSegment(draggedSegment))
    return
  }

  const newSegment = {
    id: draggedItem.id ?? nanoid(),
    type: draggedItem.type,
    variantString: draggedItem.variantString,
    width: draggedItem.actualWidth,
    elevation: draggedItem.elevation,
    label: draggedItem.label
  }

  newSegment.variant =
    draggedItem.variant ||
    getVariantArray(newSegment.type, newSegment.variantString)

  let newIndex =
    segmentAfterEl !== undefined ? segmentAfterEl + 1 : segmentBeforeEl

  if (type === Types.SLICE) {
    newIndex = newIndex <= draggedSegment ? newIndex : newIndex - 1
    store.dispatch(moveSegment(draggedSegment, newIndex))
  } else {
    store.dispatch(addSegment(newIndex, newSegment))
  }

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

  return droppedPosition < left + emptySegmentWidth
    ? 'left'
    : droppedPosition > right - emptySegmentWidth
      ? 'right'
      : null
}

/* react-dnd specs */
export const Types = {
  SLICE: 'SLICE',
  PALETTE: 'PALETTE'
}

export function createSliceDragSpec (props) {
  return {
    type: Types.SLICE,
    item: () => {
      handleSegmentDragStart()

      store.dispatch(setDraggingType(DRAGGING_TYPE_MOVE))

      return {
        id: props.segment.id,
        sliceIndex: props.sliceIndex,
        variantString: props.segment.variantString,
        type: props.segment.type,
        label: props.segment.label,
        actualWidth: props.segment.width,
        elevation: props.segment.elevation
      }
    },
    end (item, monitor) {
      store.dispatch(clearDraggingState())

      if (!monitor.didDrop()) {
        // if no object returned by a drop handler, check if it is still within the canvas
        const withinCanvas = oldDraggingState && oldDraggingState.withinCanvas
        if (withinCanvas) {
          handleSegmentCanvasDrop(item, monitor.getItemType())
        } else if (monitor.getItemType() === Types.SLICE) {
          // if existing segment is dropped outside canvas, delete it
          store.dispatch(removeSegment(props.sliceIndex))
        }
      }

      handleSegmentDragEnd()
    },
    canDrag (monitor) {
      return !store.getState().app.readOnly
    },
    isDragging (monitor) {
      return monitor.getItem().id === props.segment.id
    },
    collect (monitor, props) {
      return {
        isDragging: monitor.isDragging()
      }
    }
  }
}

export function createPaletteItemDragSpec (segment) {
  return {
    type: Types.PALETTE,
    item: () => {
      handleSegmentDragStart()

      // Initialize an empty draggingState object in Redux for palette segments
      // in order to add event listener in StreetEditable once dragging begins.
      // Also set the dragging type to MOVE. We use one action creator here and
      // one dispatch to reduce batch renders.
      store.dispatch(initDraggingState(DRAGGING_TYPE_MOVE))

      const { units } = store.getState().street
      const type = segment.id

      // The preview drag should match artwork in the thumbnail. The variant
      // string is specified by `defaultVariant`. If the property isn't present,
      // use the first defined variant in segment details.
      const variantString =
        segment.defaultVariant || Object.keys(segment.details).shift()

      // This allows dropped segment to be created with the correct elevation value
      let elevation = 0
      if (segment.defaultElevation !== undefined) {
        elevation = segment.defaultElevation
      } else {
        const variantInfo = getSegmentVariantInfo(type, variantString)
        elevation = variantInfo.elevation
      }

      return {
        id: generateRandSeed(),
        type,
        variantString,
        actualWidth: getWidthInMetric(segment.defaultWidth, units),
        elevation
      }
    },
    end: (item, monitor) => {
      store.dispatch(clearDraggingState())

      const withinCanvas = oldDraggingState?.withinCanvas
      if (!monitor.didDrop() && withinCanvas) {
        handleSegmentCanvasDrop(item, monitor.getItemType())
      }

      handleSegmentDragEnd()
    },
    canDrag: (monitor) => {
      return !store.getState().app.readOnly
    }
  }
}

export function createSliceDropTargetSpec (props, ref) {
  return {
    accept: [Types.SLICE, Types.PALETTE],
    hover (item, monitor) {
      if (!monitor.canDrop()) return

      const dragIndex = item.sliceIndex
      const hoverIndex = props.sliceIndex

      // `ref` is the slice being hovered over
      const { left } = ref.current.getBoundingClientRect()
      const hoverMiddleX = Math.round(
        left + (props.actualWidth * TILE_SIZE) / 2
      )
      const { x } = monitor.getClientOffset()

      // Ignore hovering over the dragged segment after dragging state is already set.
      // This prevents react-dnd's hover method from being confused on what to update
      // draggingState as when the dragged segment is behind another segment.
      if (dragIndex === hoverIndex && oldDraggingState) return

      if (dragIndex === hoverIndex) {
        updateIfDraggingStateChanged(
          dragIndex,
          undefined,
          item,
          monitor.getItemType()
        )
      } else {
        const { segments } = store.getState().street

        const segmentBeforeEl =
          x > hoverMiddleX && hoverIndex !== segments.length - 1
            ? hoverIndex + 1
            : hoverIndex === segments.length - 1
              ? undefined
              : hoverIndex

        const segmentAfterEl =
          x > hoverMiddleX && hoverIndex !== 0
            ? hoverIndex
            : hoverIndex === 0
              ? undefined
              : hoverIndex - 1

        updateIfDraggingStateChanged(
          segmentBeforeEl,
          segmentAfterEl,
          item,
          monitor.getItemType()
        )
      }
    }
  }
}

export function createStreetDropTargetSpec (street, ref) {
  return {
    accept: [Types.SLICE, Types.PALETTE],
    drop (item, monitor) {
      const draggedItemType = monitor.getItemType()

      handleSegmentCanvasDrop(item, draggedItemType)

      return { withinCanvas: true }
    },
    hover (item, monitor) {
      if (!monitor.canDrop()) return

      if (monitor.isOver({ shallow: true })) {
        const position = isOverLeftOrRightCanvas(
          ref.current,
          monitor.getClientOffset().x
        )

        if (!position) return

        const { segments } = street
        const segmentBeforeEl = position === 'left' ? 0 : undefined
        const segmentAfterEl =
          position === 'left' ? undefined : segments.length - 1

        updateIfDraggingStateChanged(
          segmentBeforeEl,
          segmentAfterEl,
          item,
          monitor.getItemType()
        )
      }
    }
  }
}
