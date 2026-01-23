import { nanoid } from 'nanoid'
import {
  SegmentTypes,
  getSegmentInfo,
  getSegmentVariantInfo,
} from '@streetmix/parts'

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
  setDraggingType,
} from '../store/slices/ui'
import { generateRandSeed } from '../util/random'
import { getWidthInMetric } from '../util/width_units'
import {
  RESIZE_TYPE_INITIAL,
  RESIZE_TYPE_DRAGGING,
  RESIZE_TYPE_PRECISE_DRAGGING,
  resizeSegment,
  handleSegmentResizeEnd,
  resolutionForResizeType,
  normalizeSegmentWidth,
  cancelSegmentResizeTransitions,
} from './resizing'
import { getVariantInfo, getVariantString } from './variant_utils'
import {
  TILE_SIZE,
  MIN_SEGMENT_WIDTH,
  DRAGGING_MOVE_HOLE_WIDTH,
  DRAGGING_TYPE_NONE,
  DRAGGING_TYPE_MOVE,
  DRAGGING_TYPE_RESIZE,
} from './constants'
import { segmentsChanged } from './view'

import type {
  SliceItem,
  SlopeProperties,
  SegmentDefinition,
  StreetJson,
} from '@streetmix/types'
import type { DragSourceMonitor, DropTargetMonitor } from 'react-dnd'
import type { RootState } from '../store'
import type { DraggingState } from '../types'

/* react-dnd specs */
export const DragTypes = {
  SLICE: 'SLICE',
  PALETTE: 'PALETTE',
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
  elevationChanged?: boolean
  slope: SlopeProperties
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
  right: false,
}

export function initDragTypeSubscriber() {
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

function handleSegmentResizeStart(event: MouseEvent | TouchEvent): void {
  let x: number, y: number

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

function handleSegmentResizeMove(event: MouseEvent | TouchEvent): void {
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

export function onBodyMouseDown(event: MouseEvent | TouchEvent): void {
  const { readOnly } = store.getState().app

  if (readOnly || ('touches' in event && event.touches.length !== 1)) {
    return
  }

  if ((event.target as HTMLElement).closest('.drag-handle')) {
    handleSegmentResizeStart(event)
    event.preventDefault()
  }
}

export function isSegmentWithinCanvas(
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

export function onBodyMouseMove(event: MouseEvent | TouchEvent): void {
  const { draggingType } = store.getState().ui

  if (draggingType === DRAGGING_TYPE_NONE) {
    return
  } else if (draggingType === DRAGGING_TYPE_RESIZE) {
    handleSegmentResizeMove(event)
  }

  event.preventDefault()
}

function doDropHeuristics(
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

  // Gets either the left or right slice, or `null`
  // When reading street.segments[0] this will return `undefined` for an empty
  // street (because the segments array is empty, make sure it still coalesces
  // to `null`)
  const left =
    segmentAfterEl !== null ? (street.segments[segmentAfterEl] ?? null) : null
  const right =
    segmentBeforeEl !== null ? (street.segments[segmentBeforeEl] ?? null) : null

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

  // First attempt at automatically assigning an elevation value
  // if adjacent slices' elevations have been raised
  let leftElevation: number
  // Get the boundary elevation if at left end of section
  if (left === null) {
    leftElevation = street.boundary.left.elevation ?? 0.15
    // Make sure there are values
    // Look into the implementation, apparently slope can be `on` but
    // values are an empty array, which returns `-Infinity` from `Math.max()`
  } else if (left.slope.on && left.slope.values.length > 1) {
    leftElevation = Math.max(...left.slope.values)
  } else {
    leftElevation = left.elevation
  }

  let rightElevation: number
  // Get the boundary elevation if at right end of section
  if (right === null) {
    rightElevation = street.boundary.right.elevation ?? 0.15
    // Make sure there are values
    // Look into the implementation, apparently slope can be `on` but
    // values are an empty array, which returns `-Infinity` from `Math.max()`
  } else if (right.slope.on && right.slope.values.length > 1) {
    rightElevation = Math.max(...right.slope.values)
  } else {
    rightElevation = right.elevation
  }

  // Use the highest elevation as the target drop elevation
  // There might be other strategies here (and we can fine tune)
  // TODO: Handle differences with "curb height" or "asphalt height"
  // Consider maybe using the elevation of the most dominant adjacent
  // slice? (e.g. the widest one)
  const highestElevation = Math.max(leftElevation, rightElevation)
  // Only apply highestElevation if ...
  // - it's higher than default value? (this differs by segment...)
  // - if slope is not on?
  // This is only working with drags from palette (maybe that's okay?)
  if (!draggedItem.slope.on) {
    draggedItem.elevation = highestElevation
    draggedItem.elevationChanged = true
  }
}

export function onBodyMouseUp(event: MouseEvent | TouchEvent): void {
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

function handleSegmentDragEnd(): void {
  oldDraggingState = {
    isDragging: false,
    segmentBeforeEl: null,
    segmentAfterEl: null,
    draggedSegment: null,
    withinCanvas: false,
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

function updateIfDraggingStateChanged(
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
      draggedSegment: draggedItem.sliceIndex,
    }

    store.dispatch(
      updateDraggingState({
        isDragging: true,
        segmentBeforeEl,
        segmentAfterEl,
        draggedSegment: draggedItem.sliceIndex,
      })
    )
    doDropHeuristics(draggedItem, draggedItemType)
  }

  return changed
}

function handleSegmentCanvasDrop(draggedItem: DraggedItem, type: DragType) {
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
    elevationChanged: draggedItem.elevationChanged,
    label: draggedItem.label,
    // TODO: preview slope here
  }

  newSegment.variant =
    draggedItem.variant ??
    getVariantInfo(newSegment.type, newSegment.variantString)

  let newIndex = segmentAfterEl !== null ? segmentAfterEl + 1 : segmentBeforeEl

  if (type === DragTypes.SLICE) {
    newIndex = newIndex <= draggedSegment ? newIndex : newIndex - 1
    store.dispatch(moveSegment(draggedSegment, newIndex, newSegment))
  } else {
    // If we're dropping a new slice make sure it has the basic slope property
    newSegment.slope = {
      on: false,
      values: [],
    }
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
function isOverLeftOrRightCanvas(
  segment: HTMLElement,
  droppedPosition: number | undefined
): 'left' | 'right' | null {
  if (!droppedPosition) return null

  const { remainingWidth } = store.getState().street
  const { left, right } = segment.getBoundingClientRect()

  const emptySegmentWidth = (remainingWidth * TILE_SIZE) / 2

  return droppedPosition < left + emptySegmentWidth
    ? 'left'
    : droppedPosition > right - emptySegmentWidth
      ? 'right'
      : null
}

export function createSliceDragSpec(sliceIndex: number, slice: SliceItem) {
  return {
    type: DragTypes.SLICE,
    item: (): DraggedItem => {
      store.dispatch(
        initDraggingState({
          type: DRAGGING_TYPE_MOVE,
          dragIndex: sliceIndex,
        })
      )

      return {
        id: slice.id,
        sliceIndex,
        variantString: slice.variantString,
        type: slice.type,
        label: slice.label,
        actualWidth: slice.width,
        elevation: slice.elevation,
        elevationChanged: slice.elevationChanged,
        // TODO: show actual slope in preview
        // For now the slope preview is just regular elevation value
        slope: {
          on: false,
          values: [],
        },
      }
    },
    end(item: DraggedItem, monitor: DragSourceMonitor) {
      store.dispatch(clearDraggingState())

      if (!monitor.didDrop()) {
        // if no object returned by a drop handler, check if it is still within the canvas
        const withinCanvas = oldDraggingState.withinCanvas
        const type = monitor.getItemType() as DragType
        if (withinCanvas) {
          handleSegmentCanvasDrop(item, type)
        } else if (type === DragTypes.SLICE) {
          // if existing segment is dropped outside canvas, delete it
          store.dispatch(removeSegmentAction(sliceIndex))
        }
      }

      handleSegmentDragEnd()
    },
    canDrag(_monitor: DragSourceMonitor) {
      return !store.getState().app.readOnly
    },
    isDragging(monitor: DragSourceMonitor<DraggedItem>) {
      return monitor.getItem().id === slice.id
    },
    collect(monitor: DragSourceMonitor) {
      return {
        isDragging: monitor.isDragging(),
      }
    },
  }
}

export function createPaletteItemDragSpec(segment: SegmentDefinition) {
  return {
    type: DragTypes.PALETTE,
    item: (): DraggedItem => {
      // Initialize an empty draggingState object in Redux for palette segments
      // in order to add event listener in StreetEditable once dragging begins.
      // Also set the dragging type to MOVE. We use one action creator here and
      // one dispatch to reduce batch renders.
      store.dispatch(
        initDraggingState({
          type: DRAGGING_TYPE_MOVE,
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
        slope: {
          on: false,
          values: [],
        },
      }
    },
    end: (item: DraggedItem, monitor: DragSourceMonitor) => {
      store.dispatch(clearDraggingState())

      const withinCanvas = oldDraggingState.withinCanvas
      if (!monitor.didDrop() && withinCanvas) {
        handleSegmentCanvasDrop(item, monitor.getItemType() as DragType)
      }

      handleSegmentDragEnd()
    },
    canDrag: (_monitor: DragSourceMonitor) => {
      return !store.getState().app.readOnly
    },
  }
}

export function createSliceDropTargetSpec(
  sliceIndex: number,
  slice: SliceItem,
  ref: React.RefObject<HTMLDivElement | null>
) {
  return {
    accept: [DragTypes.SLICE, DragTypes.PALETTE],
    hover(item: DraggedItem, monitor: DropTargetMonitor) {
      if (!monitor.canDrop() || !ref.current) return

      const dragIndex = item.sliceIndex
      const hoverIndex = sliceIndex

      // `ref` is the slice being hovered over
      const { left } = ref.current.getBoundingClientRect()
      const hoverMiddleX = Math.round(left + (slice.width * TILE_SIZE) / 2)
      const x = monitor.getClientOffset()?.x

      if (!x) return

      if (dragIndex === hoverIndex) {
        updateIfDraggingStateChanged(
          dragIndex,
          null,
          item,
          monitor.getItemType() as DragType
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
          monitor.getItemType() as DragType
        )
      }
    },
  }
}

export function createStreetDropTargetSpec(
  street: StreetJson,
  ref: React.RefObject<HTMLDivElement | null>
) {
  return {
    accept: [DragTypes.SLICE, DragTypes.PALETTE],
    drop(item: DraggedItem, monitor: DropTargetMonitor) {
      const draggedItemType = monitor.getItemType() as DragType

      handleSegmentCanvasDrop(item, draggedItemType)

      return { withinCanvas: true }
    },
    hover(item: DraggedItem, monitor: DropTargetMonitor) {
      if (!monitor.canDrop() || !ref.current) return

      if (monitor.isOver({ shallow: true })) {
        const position = isOverLeftOrRightCanvas(
          ref.current,
          monitor.getClientOffset()?.x
        )

        if (!position) return

        const { segments } = street
        const segmentBeforeEl = position === 'left' ? 0 : null
        const segmentAfterEl = position === 'left' ? null : segments.length - 1

        updateIfDraggingStateChanged(
          segmentBeforeEl,
          segmentAfterEl,
          item,
          monitor.getItemType() as DragType
        )
      }
    },
  }
}
