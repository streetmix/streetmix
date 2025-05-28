import React, { useState, useRef, useEffect, useCallback } from 'react'
import { CSSTransition } from 'react-transition-group'
import { useDrag, useDrop } from 'react-dnd'

import { useSelector, useDispatch } from '~/src/store/hooks'
import EmptyDragPreview from '~/src/ui/dnd/EmptyDragPreview'
import { usePrevious } from '~/src/util/usePrevious'
import { infoBubble } from '../info_bubble/info_bubble'
import { INFO_BUBBLE_TYPE_SEGMENT } from '../info_bubble/constants'
import { formatMessage } from '../locales/locale'
import { setActiveSegment } from '../store/slices/ui'
import {
  incrementSegmentWidth,
  removeSegmentAction,
  clearSegmentsAction
} from '../store/actions/street'
import { addToast } from '../store/slices/toasts'
import { getSegmentCapacity } from './capacity'
import { getLocaleSegmentName } from './view'
import SegmentCanvas from './SegmentCanvas'
import SegmentDragHandles from './SegmentDragHandles'
import SegmentLabelContainer from './SegmentLabelContainer'

import {
  TILE_SIZE,
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL,
  SEGMENT_WARNING_WIDTH_TOO_LARGE
} from './constants'
import { createSliceDragSpec, createSliceDropTargetSpec } from './drag_and_drop'
import { getSegmentInfo } from './info'
import { RESIZE_TYPE_INCREMENT } from './resizing'
import type { SliceItem, UnitsSetting } from '@streetmix/types'
import './Segment.css'

interface SliceProps {
  sliceIndex: number
  segment: SliceItem
  units: UnitsSetting
  segmentLeft: number
}

function Segment (props: SliceProps): React.ReactNode {
  const { sliceIndex, segment, units, segmentLeft } = props
  const [switchSegments, setSwitchSegments] = useState(false)
  const [oldVariant, setOldVariant] = useState<string>(segment.variantString)

  const enableAnalytics = useSelector(
    (state) => state.flags.ANALYTICS.value && state.street.showAnalytics
  )
  const locale = useSelector((state) => state.locale.locale)
  const descriptionVisible = useSelector(
    (state) => state.infoBubble.descriptionVisible
  )
  const activeSegment = useSelector((state) =>
    typeof state.ui.activeSegment === 'number' ? state.ui.activeSegment : null
  )
  const capacitySource = useSelector((state) => state.street.capacitySource)
  const dispatch = useDispatch()

  // What is this?
  const initialRender = useRef(true)
  const streetSegment = useRef<HTMLDivElement>(null)
  const dndRef = useRef<HTMLDivElement>(null)

  // These refs are a workaround for CSSTransition's dependence on
  // findDOMNode, which is deprecated.
  const oldRef = useRef<HTMLDivElement>(null)
  const newRef = useRef<HTMLDivElement>(null)

  // Set up drag and drop targets
  // Specs are created on each render with changed props
  const dropSpec = createSliceDropTargetSpec(props, streetSegment)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [collectedProps, drop] = useDrop(dropSpec)
  const dragSpec = createSliceDragSpec(props)
  const [collected, drag, dragPreview] = useDrag(dragSpec)
  const { isDragging }: { isDragging: boolean } = collected
  drag(drop(dndRef))

  // Keep previous state for comparisons (ported from legacy behavior)
  const prevProps = usePrevious({
    segment,
    isDragging
  })

  useEffect(() => {
    // TODO: there should be checks if the calls to the prop methods should be made in the first place. see discussion here: https://github.com/streetmix/streetmix/pull/1227#discussion_r263536187
    // During a segment removal or a dragging action, the infoBubble temporarily does not appear
    // for the hovered/dragged segment. Once the removal or drag action ends, the infoBubble for
    // the active segment should be shown. The following IF statement checks to see if a removal
    // or drag action occurred previously to this segment and displays the infoBubble for the
    // segment if it is equal to the activeSegment and no infoBubble was shown already.
    if (prevProps === undefined) return

    const wasDragging =
      (prevProps.isDragging && !isDragging) ||
      (initialRender.current && activeSegment !== null)

    initialRender.current = false

    if (wasDragging && activeSegment === sliceIndex) {
      infoBubble.considerShowing(
        false,
        streetSegment.current,
        INFO_BUBBLE_TYPE_SEGMENT
      )
    }
  }, [isDragging, activeSegment, sliceIndex])

  useEffect(() => {
    if (
      prevProps !== undefined &&
      prevProps.segment.variantString !== segment.variantString
    ) {
      handleSwitchSegments(prevProps.segment.variantString)
    }
  }, [segment.variantString])

  // Also animate the switching if elevation changes.
  // Maybe we don't always do this forever, but it makes it match
  // existing elevation variant behavior
  useEffect(() => {
    if (
      prevProps !== undefined &&
      prevProps.segment.elevation !== segment.elevation
    ) {
      handleSwitchSegments(prevProps.segment.variantString)
    }
  }, [segment.elevation])

  // Cleanup effect
  useEffect(() => {
    // Event handler is only added on mouseover, but definitely remove if
    // component is unmounted.
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // When called by CSSTransition `onExited`, `oldVariant` is not passed to the
  // function (is undefined). `switchSegments` should be `true` when this happens.
  function handleSwitchSegments (oldVariant?: string): void {
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

  function handleSegmentMouseEnter (event: React.MouseEvent): void {
    dispatch(setActiveSegment(sliceIndex))

    document.addEventListener('keydown', handleKeyDown)
    infoBubble.considerShowing(
      event,
      streetSegment.current,
      INFO_BUBBLE_TYPE_SEGMENT
    )
  }

  function handleSegmentMouseLeave (): void {
    document.removeEventListener('keydown', handleKeyDown)
    infoBubble.dontConsiderShowing()
  }

  function decrementWidth (position: number, finetune: boolean): void {
    dispatch(
      incrementSegmentWidth(
        position, // slice index
        false, // subtract
        finetune, // true if shift key is pressed
        RESIZE_TYPE_INCREMENT
      )
    )
  }

  function incrementWidth (position: number, finetune: boolean): void {
    dispatch(
      incrementSegmentWidth(
        position, // slice index
        true, // add
        finetune, // true if shift key is pressed
        RESIZE_TYPE_INCREMENT
      )
    )
  }

  // `event` type is not a React event because listener is attached through DOM
  // We need to define a callback so React can properly clean up event handlers
  const handleKeyDown = useCallback((event: KeyboardEvent): void => {
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
        // Prevent deletion from occurring if the description is visible
        if (descriptionVisible) return

        // If the shift key is pressed, we remove all segments
        if (event.shiftKey) {
          dispatch(clearSegmentsAction())
          infoBubble.hide()
          dispatch(
            addToast({
              message: formatMessage(
                'toast.all-segments-deleted',
                'All segments have been removed.'
              ),
              component: 'TOAST_UNDO'
            })
          )
        } else {
          infoBubble.hide()
          infoBubble.hideSegment()
          dispatch(
            addToast({
              message: formatMessage(
                'toast.segment-deleted',
                'The segment has been removed.'
              ),
              component: 'TOAST_UNDO'
            })
          )
          dispatch(removeSegmentAction(sliceIndex))
        }
        break
      default:
        break
    }
  }, [])

  function renderSegmentCanvas (
    variantType: string,
    nodeRef: React.RefObject<HTMLDivElement | null>
  ): React.ReactNode {
    const isOldVariant = variantType === 'old'

    // The segment ID is a string that uniquely identifies the segment
    // and can be used as a consistent and reliable seed for a PRNG
    const randSeed = segment.id

    return (
      <div ref={nodeRef} style={{ width: '100%', height: '100%' }}>
        <SegmentCanvas
          actualWidth={segment.width}
          type={segment.type}
          variantString={isOldVariant ? oldVariant : segment.variantString}
          randSeed={randSeed}
          elevation={segment.elevation}
        />
      </div>
    )
  }

  const segmentInfo = getSegmentInfo(segment.type)

  // Get localized names from store, fall back to segment default names if
  // translated text is not found. TODO: port to react-intl/formatMessage later.
  const displayName =
    segment.label ?? getLocaleSegmentName(segment.type, segment.variantString)

  const average = getSegmentCapacity(segment, capacitySource)?.average
  const elementWidth = segment.width * TILE_SIZE

  const segmentStyle = {
    width: elementWidth + 'px',
    zIndex: segmentInfo.zIndex,
    transform: `translateX(${segmentLeft}px)`
  }

  const classNames = ['segment']

  if (isDragging) {
    classNames.push('dragged-out')
  } else if (activeSegment === sliceIndex) {
    classNames.push('hover', 'show-drag-handles')
  }

  // Warnings
  if (
    segment.warnings[SEGMENT_WARNING_OUTSIDE] ||
    segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] ||
    segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]
  ) {
    classNames.push('warning')
  }
  if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
    classNames.push('outside')
  }

  return (
    <div
      style={segmentStyle}
      className={classNames.join(' ')}
      data-testid="segment"
      data-slice-index={sliceIndex}
      ref={streetSegment}
      onMouseEnter={handleSegmentMouseEnter}
      onMouseLeave={handleSegmentMouseLeave}
    >
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
      <div className="hover-bk" />
      <EmptyDragPreview dragPreview={dragPreview} />
    </div>
  )
}

export default Segment
