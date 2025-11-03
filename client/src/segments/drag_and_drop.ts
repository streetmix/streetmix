import { nanoid } from 'nanoid'

import { app } from '../preinit/app_settings'
import { setIgnoreStreetChanges } from '../streets/data_model'
import { getElAbsolutePos } from '../util/helpers'
import store, { observeStore } from '../store'
import { addSegment, moveSegment } from '../store/slices/street'
import { removeSegmentAction } from '../store/actions/street'
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
  cancelSegmentResizeTransitions
} from './resizing'
import { getVariantInfo, getVariantString } from './variant_utils'
import {
  TILE_SIZE,
  MIN_SEGMENT_WIDTH,
  DRAGGING_MOVE_HOLE_WIDTH,
  DRAGGING_TYPE_NONE,
  DRAGGING_TYPE_MOVE,
  DRAGGING_TYPE_RESIZE
} from './constants'
import { segmentsChanged } from './view'

import type {
  ElevationChange,
  SegmentDefinition,
  StreetJson
} from '@streetmix/types'
import type { DragSourceMonitor, DropTargetMonitor } from 'react-dnd'
import type { RootState } from '../store'
import type { DraggingState } from '../types'

/* react-dnd specs */
export const DragTypes = {
  SLICE: 'SLICE',
  PALETTE: 'PALETTE'
} as const

export type DragType = (typeof DragTypes)[keyof typeof DragTypes]

// NOTE: is similar to SliceItem / Segment type
export interface DraggedItem {
  id: string
  sliceIndex: number
  variantString: string
  type: string
  label?: string
  actualWidth: number
  elevation: number
  slope: boolean | ElevationChange
}

export const draggingResize: {
  segmentEl: HTMLElement | null
  floatingEl: HTMLElement | null
  mouseX: number | null
  mouseY: number | null
  elX: number | null
  elY: number | null
  width: number | null
  originalX: number | null
  originalWidth: number | null
  right: boolean
} = {
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
  const select = (state: RootState) => state.ui.draggingType

  const onChange = (draggingType: number) => {
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

function handleSegmentResizeStart (event: MouseEvent | TouchEvent): void {
  let x: number, y: number
  if (app.readOnly) {
    return
  }

  if ('touches' in event && event.touches[0]) {
    x = event.touches[0].pageX
    y = event.touches[0].pageY
  } else if ('pageX' in event) {
    x = event.pageX
    y = event.pageY
  } else {
    return
  }

  setIgnoreStreetChanges(true)

  const el = (event.target as HTMLElement).closest(
    '.drag-handle'
  ) as HTMLElement

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
    pos[0] -
    (document.querySelector('#street-section-outer') as HTMLElement)
      .scrollLeft +
    'px'
  draggingResize.floatingEl.style.top = pos[1] + 'px'
  document.body.appendChild(draggingResize.floatingEl)

  draggingResize.mouseX = x
  draggingResize.mouseY = y

  draggingResize.elX = pos[0]
  draggingResize.elY = pos[1]

  draggingResize.originalX = draggingResize.elX
  const sliceIndex = Number((el.parentNode as HTMLElement).dataset.sliceIndex)
  draggingResize.originalWidth =
    store.getState().street.segments[sliceIndex].width
  draggingResize.segmentEl = el.parentNode as HTMLElement

  draggingResize.segmentEl.classList.add('hover')

  window.setTimeout(function () {
    draggingResize.segmentEl.classList.add('hover')
  }, 0)
}

function handleSegmentResizeMove (event: MouseEvent | TouchEvent): void {
  let x, y, resizeType
  if ('touches' in event && event.touches[0]) {
    x = event.touches[0].pageX
    y = event.touches[0].pageY
  } else if ('pageX' in event) {
    x = event.pageX
    y = event.pageY
  } else {
    return
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

export function onBodyMouseDown (event: MouseEvent | TouchEvent): void {
  if (app.readOnly || ('touches' in event && event.touches.length !== 1)) {
    return
  }

  if ((event.target as HTMLElement).closest('.drag-handle')) {
    handleSegmentResizeStart(event)
    event.preventDefault()
  }
}

export function isSegmentWithinCanvas (
  event: MouseEvent | TouchEvent,
  canvasEl: HTMLElement
): boolean {
  const { remainingWidth } = store.getState().street

  let x: number, y: number
  if ('touches' in event && event.touches[0]) {
    x = event.touches[0].pageX
    y = event.touches[0].pageY
  } else if ('x' in event) {
    x = event.x
    y = event.y
  } else {
    return false
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

export function onBodyMouseMove (event: MouseEvent | TouchEvent): void {
  const { draggingType } = store.getState().ui

  if (draggingType === DRAGGING_TYPE_NONE) {
    return
  } else if (draggingType === DRAGGING_TYPE_RESIZE) {
    handleSegmentResizeMove(event)
  }

  event.preventDefault()
}

function doDropHeuristics (
  draggedItem: DraggedItem,
  draggedItemType: DragType
): void {
  // Automatically figure out width
  const street = store.getState().street
  const { variantString, type, actualWidth } = draggedItem

  if (draggedItemType === DragTypes.PALETTE) {
    if (street.remainingWidth > 0 && actualWidth > street.remainingWidth) {
      const variantMinWidth = getSegmentVariantInfo(
        type,
        variantString
      ).minWidth
      let segmentMinWidth = 0
      if (variantMinWidth !== undefined) {
        segmentMinWidth = getWidthInMetric(variantMinWidth, street.units)
      }

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

  const left = segmentAfterEl !== null ? street.segments[segmentAfterEl] : null
  const right =
    segmentBeforeEl !== null ? street.segments[segmentBeforeEl] : null

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

  const leftVariant = left && getVariantInfo(left.type, left.variantString)
  const rightVariant = right && getVariantInfo(right.type, right.variantString)

  const variant = getVariantInfo(type, variantString)
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

export function onBodyMouseUp (event: MouseEvent | TouchEvent): void {
  const { draggingType } = store.getState().ui

  switch (draggingType) {
    case DRAGGING_TYPE_NONE:
      return
    case DRAGGING_TYPE_RESIZE:
      handleSegmentResizeEnd()
      break
  }

  event.preventDefault()
}

function handleSegmentDragEnd (): void {
  oldDraggingState = {
    isDragging: false,
    segmentBeforeEl: null,
    segmentAfterEl: null,
    draggedSegment: null,
    withinCanvas: false
  }
  cancelSegmentResizeTransitions()
  segmentsChanged()

  document.body.classList.remove('not-within-canvas')
}

let oldDraggingState: DraggingState & {
  withinCanvas?: boolean
}

// Checks to see if Redux dragging state needs to be updated, and if so, dispatches action.
// This prevents a constant dispatch of the updateDraggingState action which causes the
// dragging of the segment to be laggy and choppy.

function updateIfDraggingStateChanged (
  segmentBeforeEl: number | null,
  segmentAfterEl: number | null,
  draggedItem: DraggedItem,
  draggedItemType: DragType
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
      ...oldDraggingState,
      isDragging: true,
      segmentBeforeEl,
      segmentAfterEl,
      draggedSegment: draggedItem.sliceIndex
    }

    store.dispatch(
      updateDraggingState({
        isDragging: true,
        segmentBeforeEl,
        segmentAfterEl,
        draggedSegment: draggedItem.sliceIndex
      })
    )
    doDropHeuristics(draggedItem, draggedItemType)
  }

  return changed
}

function handleSegmentCanvasDrop (
  draggedItem: DraggedItem,
  type: DragType | null
) {
  // If monitor.getItemType() returns `null` type, bail
  if (type === null) return

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
    label: draggedItem.label,
    slope: false
  }

  newSegment.variant =
    draggedItem.variant ??
    getVariantInfo(newSegment.type, newSegment.variantString)

  let newIndex = segmentAfterEl !== null ? segmentAfterEl + 1 : segmentBeforeEl

  if (type === DragTypes.SLICE) {
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
 * @param segment - reference to StreetEditable
 * @param droppedPosition - x position of dropped segment in reference
 *    to StreetEditable
 * @returns `left` or `right`; or `null` if dropped/hovered over a segment
 */
function isOverLeftOrRightCanvas (
  segment: HTMLElement,
  droppedPosition: number
): string | null {
  const { remainingWidth } = store.getState().street
  const { left, right } = segment.getBoundingClientRect()

  const emptySegmentWidth = (remainingWidth * TILE_SIZE) / 2

  return droppedPosition < left + emptySegmentWidth
    ? 'left'
    : droppedPosition > right - emptySegmentWidth
      ? 'right'
      : null
}

export function createSliceDragSpec (props) {
  return {
    type: DragTypes.SLICE,
    item: (): DraggedItem => {
      store.dispatch(
        initDraggingState({
          type: DRAGGING_TYPE_MOVE,
          dragIndex: props.sliceIndex
        })
      )

      return {
        id: props.segment.id,
        sliceIndex: props.sliceIndex,
        variantString: props.segment.variantString,
        type: props.segment.type,
        label: props.segment.label,
        actualWidth: props.segment.width,
        elevation: props.segment.elevation,
        // TODO: show actual slope in preview
        // For now the slope preview is just regular elevation value
        slope: {
          left: props.segment.elevation,
          right: props.segment.elevation
        }
      }
    },
    end (item: DraggedItem, monitor: DragSourceMonitor) {
      store.dispatch(clearDraggingState())

      if (!monitor.didDrop()) {
        // if no object returned by a drop handler, check if it is still within the canvas
        const withinCanvas = oldDraggingState.withinCanvas
        if (withinCanvas) {
          handleSegmentCanvasDrop(item, monitor.getItemType())
        } else if (monitor.getItemType() === DragTypes.SLICE) {
          // if existing segment is dropped outside canvas, delete it
          store.dispatch(removeSegmentAction(props.sliceIndex))
        }
      }

      handleSegmentDragEnd()
    },
    canDrag (monitor: DragSourceMonitor) {
      return !store.getState().app.readOnly
    },
    isDragging (monitor: DragSourceMonitor<DraggedItem>) {
      return monitor.getItem().id === props.segment.id
    },
    collect (monitor: DragSourceMonitor) {
      return {
        isDragging: monitor.isDragging()
      }
    }
  }
}

export function createPaletteItemDragSpec (segment: SegmentDefinition) {
  return {
    type: DragTypes.PALETTE,
    item: (): DraggedItem => {
      // Initialize an empty draggingState object in Redux for palette segments
      // in order to add event listener in StreetEditable once dragging begins.
      // Also set the dragging type to MOVE. We use one action creator here and
      // one dispatch to reduce batch renders.
      store.dispatch(
        initDraggingState({
          type: DRAGGING_TYPE_MOVE
        })
      )

      const { units } = store.getState().street
      const type = segment.id

      // The preview drag should match artwork in the thumbnail. The variant
      // string is specified by `defaultVariant`. If the property isn't present,
      // use the first defined variant in segment details.
      const variantString =
        segment.defaultVariant ?? Object.keys(segment.details).shift()

      // This allows dropped segment to be created with the correct elevation value
      let elevation = 0
      if (segment.defaultElevation !== undefined) {
        if (typeof segment.defaultElevation !== 'number') {
          elevation = getWidthInMetric(segment.defaultElevation, units)
        } else {
          elevation = segment.defaultElevation
        }
      } else {
        const variantInfo = getSegmentVariantInfo(type, variantString)
        if (typeof variantInfo.elevation !== 'number') {
          elevation = getWidthInMetric(variantInfo.elevation, units)
        } else {
          elevation = variantInfo.elevation
        }
      }

      return {
        id: generateRandSeed(),
        type,
        variantString,
        actualWidth: getWidthInMetric(segment.defaultWidth, units),
        elevation,
        slope: false
      }
    },
    end: (item: DraggedItem, monitor: DragSourceMonitor) => {
      store.dispatch(clearDraggingState())

      const withinCanvas = oldDraggingState.withinCanvas
      if (!monitor.didDrop() && withinCanvas) {
        handleSegmentCanvasDrop(item, monitor.getItemType())
      }

      handleSegmentDragEnd()
    },
    canDrag: (monitor: DragSourceMonitor) => {
      return !store.getState().app.readOnly
    }
  }
}

export function createSliceDropTargetSpec (
  props,
  ref: React.Ref<HTMLDivElement>
) {
  return {
    accept: [DragTypes.SLICE, DragTypes.PALETTE],
    hover (item: DraggedItem, monitor: DropTargetMonitor) {
      if (!monitor.canDrop()) return

      const dragIndex = item.sliceIndex
      const hoverIndex = props.sliceIndex

      // `ref` is the slice being hovered over
      const { left } = ref.current.getBoundingClientRect()
      const hoverMiddleX = Math.round(
        left + (props.segment.width * TILE_SIZE) / 2
      )
      const { x } = monitor.getClientOffset()

      if (dragIndex === hoverIndex) {
        updateIfDraggingStateChanged(
          dragIndex,
          null,
          item,
          monitor.getItemType()
        )
      } else {
        const { segments } = store.getState().street

        const segmentBeforeEl =
          x > hoverMiddleX && hoverIndex !== segments.length - 1
            ? hoverIndex + 1
            : hoverIndex === segments.length - 1
              ? null
              : hoverIndex

        const segmentAfterEl =
          x > hoverMiddleX && hoverIndex !== 0
            ? hoverIndex
            : hoverIndex === 0
              ? null
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

export function createStreetDropTargetSpec (
  street: StreetJson,
  ref: React.Ref<HTMLDivElement>
) {
  return {
    accept: [DragTypes.SLICE, DragTypes.PALETTE],
    drop (item: DraggedItem, monitor: DropTargetMonitor) {
      const draggedItemType = monitor.getItemType()

      handleSegmentCanvasDrop(item, draggedItemType)

      return { withinCanvas: true }
    },
    hover (item: DraggedItem, monitor: DropTargetMonitor) {
      if (!monitor.canDrop()) return

      if (monitor.isOver({ shallow: true })) {
        const position = isOverLeftOrRightCanvas(
          ref.current,
          monitor.getClientOffset().x
        )

        if (!position) return

        const { segments } = street
        const segmentBeforeEl = position === 'left' ? 0 : null
        const segmentAfterEl = position === 'left' ? null : segments.length - 1

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
