import React, { useState, useRef, useEffect, useCallback } from 'react'
import { CSSTransition } from 'react-transition-group'
import { useDrag, useDrop } from 'react-dnd'
import { getSegmentInfo } from '@streetmix/parts'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { PopupContainer } from '~/src/info_bubble/PopupContainer'
import EmptyDragPreview from '~/src/ui/dnd/EmptyDragPreview'
import { usePrevious } from '~/src/util/usePrevious'
import { setActiveSegment } from '../store/slices/ui'
import {
  incrementSegmentWidth,
  removeSegmentAction,
  clearSegmentsAction,
} from '../store/actions/street'
import { getSegmentCapacity } from './capacity'
import { getLocaleSegmentName } from './view'
import SegmentCanvas from './SegmentCanvas'
import SegmentDragHandles from './SegmentDragHandles'
import SegmentLabelContainer from './SegmentLabelContainer'

import {
  TILE_SIZE,
  SLICE_WARNING_OUTSIDE,
  SLICE_WARNING_WIDTH_TOO_SMALL,
  SLICE_WARNING_WIDTH_TOO_LARGE,
  SLICE_WARNING_SLOPE_EXCEEDED_BERM,
} from './constants'
import { createSliceDragSpec, createSliceDropTargetSpec } from './drag_and_drop'
import { RESIZE_TYPE_INCREMENT } from './resizing'
import TestSlope from './TestSlope'
import './Segment.css'

import { calculateSlope } from './slope'
import type { SliceItem, UnitsSetting } from '@streetmix/types'

interface SliceProps {
  sliceIndex: number
  segment: SliceItem
  units: UnitsSetting
  segmentLeft: number
}

function Segment(props: SliceProps): React.ReactNode {
  const { sliceIndex, segment, units, segmentLeft } = props
  const [switchSegments, setSwitchSegments] = useState(false)
  const [oldVariant, setOldVariant] = useState<string>(segment.variantString)

  const street = useSelector((state) => state.street)
  const enableAnalytics = useSelector(
    (state) => state.flags.ANALYTICS.value && state.street.showAnalytics
  )
  const locale = useSelector((state) => state.locale.locale)
  const activeSegment = useSelector((state) => state.ui.activeSegment)
  const infoBubbleHovered = useSelector((state) => state.infoBubble.mouseInside)
  const coastmixMode = useSelector((state) => state.flags.COASTMIX_MODE.value)
  const dispatch = useDispatch()

  const streetSegment = useRef<HTMLDivElement>(null)
  const dndRef = useRef<HTMLDivElement>(null)

  // These refs are a workaround for CSSTransition's dependence on
  // findDOMNode, which is deprecated.
  const oldRef = useRef<HTMLDivElement>(null)
  const newRef = useRef<HTMLDivElement>(null)

  // Set up drag and drop targets
  // Specs are created on each render with changed props
  const dropSpec = createSliceDropTargetSpec(props, streetSegment)
  const [, drop] = useDrop(dropSpec)
  const dragSpec = createSliceDragSpec(props)
  const [collected, drag, dragPreview] = useDrag(dragSpec)
  const { isDragging }: { isDragging: boolean } = collected
  drag(drop(dndRef))

  // Keep previous state for comparisons (ported from legacy behavior)
  const prevProps = usePrevious({
    segment,
    isDragging,
  })

  useEffect(() => {
    if (
      prevProps !== null &&
      prevProps.segment.variantString !== segment.variantString
    ) {
      handleSwitchSegments(prevProps.segment.variantString)
    }
  }, [segment.variantString])

  const decrementWidth = useCallback(
    (position: number, finetune: boolean): void => {
      dispatch(
        incrementSegmentWidth(
          position, // slice index
          false, // subtract
          finetune, // true if shift key is pressed
          RESIZE_TYPE_INCREMENT
        )
      )
    },
    [dispatch]
  )

  const incrementWidth = useCallback(
    (position: number, finetune: boolean): void => {
      dispatch(
        incrementSegmentWidth(
          position, // slice index
          true, // add
          finetune, // true if shift key is pressed
          RESIZE_TYPE_INCREMENT
        )
      )
    },
    [dispatch]
  )

  // `event` type is not a React event because listener is attached through DOM
  // We need to define a callback so React can properly clean up event handlers
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      // Bail if hovered over infobubble popup
      if (infoBubbleHovered) return

      switch (event.key) {
        case '-':
        case '_':
          if (event.metaKey || event.ctrlKey || event.altKey) return

          event.preventDefault()
          decrementWidth(sliceIndex, event.shiftKey)
          break
        // Plus (+) may only triggered with shift key, so also check if
        // the same physical key (Equal) is pressed
        case '+':
        case '=':
          if (event.metaKey || event.ctrlKey || event.altKey) return

          event.preventDefault()
          incrementWidth(sliceIndex, event.shiftKey)
          break
        case 'Backspace':
        case 'Delete':
          // If the shift key is pressed, we remove all segments
          if (event.shiftKey) {
            dispatch(clearSegmentsAction())
          } else {
            dispatch(removeSegmentAction(sliceIndex))
          }
          break
        default:
          break
      }
    },
    [decrementWidth, incrementWidth, sliceIndex, infoBubbleHovered, dispatch]
  )

  // Cleanup effect
  useEffect(() => {
    // Event handler is only added on mouseover, but definitely remove if
    // component is unmounted.
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // When called by CSSTransition `onExited`, `oldVariant` is not passed to the
  // function (is undefined). `switchSegments` should be `true` when this happens.
  function handleSwitchSegments(oldVariant?: string): void {
    setSwitchSegments(!switchSegments)
    if (switchSegments) {
      setOldVariant(segment.variantString)
    } else {
      if (oldVariant === undefined) {
        throw new Error('oldVariant should be defined')
      }
      setOldVariant(oldVariant)
    }
  }

  function handleSegmentMouseEnter(): void {
    dispatch(setActiveSegment(sliceIndex))
    document.addEventListener('keydown', handleKeyDown)
  }

  function handleSegmentMouseLeave(): void {
    dispatch(setActiveSegment(null))
    document.removeEventListener('keydown', handleKeyDown)
  }

  function renderSegmentCanvas(
    variantType: string,
    nodeRef: React.RefObject<HTMLDivElement | null>
  ): React.ReactNode {
    const isOldVariant = variantType === 'old'

    const slopeData = calculateSlope(street, sliceIndex)
    // TODO: slope values should be calced elsewhere and saved
    const slopeTemp = { ...segment.slope }
    if (slopeData !== null) {
      slopeTemp.values = slopeData.values
    }

    return (
      <div ref={nodeRef} style={{ width: '100%', height: '100%' }}>
        <SegmentCanvas
          actualWidth={segment.width}
          type={segment.type}
          variantString={isOldVariant ? oldVariant : segment.variantString}
          // The segment ID is a string that uniquely identifies the segment
          // and can be used as a consistent and reliable seed for a PRNG
          randSeed={segment.id}
          elevation={segment.elevation}
          slope={slopeTemp}
        />
        {coastmixMode && <TestSlope slice={segment} />}
      </div>
    )
  }

  const segmentInfo = getSegmentInfo(segment.type)

  // Get localized names from store, fall back to segment default names if
  // translated text is not found. TODO: port to react-intl/formatMessage later.
  const displayName =
    segment.label ?? getLocaleSegmentName(segment.type, segment.variantString)

  const average = getSegmentCapacity(segment, street.capacitySource)?.average
  const elementWidth = segment.width * TILE_SIZE

  const segmentStyle = {
    width: elementWidth + 'px',
    zIndex: segmentInfo.zIndex,
    transform: `translateX(${segmentLeft}px)`,
  }

  const classNames = ['segment']

  if (isDragging) {
    classNames.push('dragged-out')
  } else if (activeSegment === sliceIndex) {
    classNames.push('active', 'show-drag-handles')
  }

  // Warnings
  // TODO: implement SLICE_WARNING_SLOPE_EXCEEDED_PATH
  if (
    segment.warnings[SLICE_WARNING_OUTSIDE] ||
    segment.warnings[SLICE_WARNING_WIDTH_TOO_SMALL] ||
    segment.warnings[SLICE_WARNING_WIDTH_TOO_LARGE] ||
    segment.warnings[SLICE_WARNING_SLOPE_EXCEEDED_BERM]
  ) {
    classNames.push('warning')
  }
  if (segment.warnings[SLICE_WARNING_OUTSIDE]) {
    classNames.push('outside')
  }

  return (
    <div
      style={segmentStyle}
      className={classNames.join(' ')}
      data-testid="segment"
      ref={streetSegment}
      onMouseEnter={handleSegmentMouseEnter}
      onMouseLeave={handleSegmentMouseLeave}
    >
      <PopupContainer
        type="slice"
        position={sliceIndex}
        isDragging={isDragging}
      >
        <button data-slice-index={sliceIndex}>
          <SegmentLabelContainer
            label={displayName}
            width={segment.width}
            units={units}
            locale={locale}
            capacity={average}
            showCapacity={enableAnalytics}
          />
          <SegmentDragHandles width={elementWidth} />
          <div ref={dndRef} className="segment-canvas-container">
            <CSSTransition
              key="old-variant"
              in={!switchSegments}
              classNames="switching-away"
              timeout={250}
              onExited={handleSwitchSegments}
              unmountOnExit
              nodeRef={oldRef}
            >
              {renderSegmentCanvas('old', oldRef)}
            </CSSTransition>
            <CSSTransition
              key="new-variant"
              in={switchSegments}
              classNames="switching-in"
              timeout={250}
              unmountOnExit
              nodeRef={newRef}
            >
              {renderSegmentCanvas('new', newRef)}
            </CSSTransition>
          </div>
          <div className="active-bg" />
          <EmptyDragPreview dragPreview={dragPreview} />
        </button>
      </PopupContainer>
    </div>
  )
}

export default Segment
