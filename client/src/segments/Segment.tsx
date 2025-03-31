import React, { useState, useRef, useEffect, useCallback } from 'react'
import { CSSTransition } from 'react-transition-group'

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
import {
  _getBugfix,
  _resetBugfix,
  createSliceDropTargetSpec
} from './drag_and_drop'
import { getSegmentInfo } from './info'
import { RESIZE_TYPE_INCREMENT } from './resizing'
import './Segment.css'
import type { SliceItem, UnitsSetting } from '@streetmix/types'
import { useDrop } from 'react-dnd'

interface SegmentProps {
  sliceIndex: number
  segment: SliceItem
  units: UnitsSetting
  segmentLeft: number
}

function Segment (props: SegmentProps): React.ReactNode {
  const { sliceIndex, segment, units, segmentLeft } = props
  const [switchSegments, setSwitchSegments] = useState(false)
  const [oldVariant, setOldVariant] = useState<string>(segment.variantString)

  const enableAnalytics = useSelector((state) => state.flags.ANALYTICS.value && state.street.showAnalytics)
  const locale = useSelector((state) => state.locale.locale)
  const descriptionVisible = useSelector((state) => state.infoBubble.descriptionVisible)
  const activeSegment = useSelector((state) => typeof state.ui.activeSegment === 'number'
    ? state.ui.activeSegment
    : null)
  const capacitySource = useSelector((state) => state.street.capacitySource)
  const dispatch = useDispatch()

  const isDragging = false // temp

  // Keep previous state for comparisons (ported from legacy behavior)
  const prevProps = usePrevious({
    segment,
    isDragging
  })

  // What is this?
  const initialRender = useRef(true)
  const streetSegment = useRef<HTMLDivElement>(null)

  // These refs are a workaround for CSSTransition's dependence on
  // findDOMNode, which is deprecated.
  const oldRef = useRef<HTMLDivElement>(null)
  const newRef = useRef<HTMLDivElement>(null)

  // Set up drop target
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [collectedProps, drop] = useDrop(() => createSliceDropTargetSpec(props, streetSegment))

  // componentDidUpdate (prevProps, prevState) {
  //   // TODO: there should be checks if the calls to the prop methods should be made in the first place. see discussion here: https://github.com/streetmix/streetmix/pull/1227#discussion_r263536187
  //   // During a segment removal or a dragging action, the infoBubble temporarily does not appear
  //   // for the hovered/dragged segment. Once the removal or drag action ends, the infoBubble for
  //   // the active segment should be shown. The following IF statement checks to see if a removal
  //   // or drag action occurred previously to this segment and displays the infoBubble for the
  //   // segment if it is equal to the activeSegment and no infoBubble was shown already.
  //   const wasDragging =
  //     (prevProps.isDragging && !this.props.isDragging) ||
  //     (initialRender &&
  //       (activeSegment || activeSegment === 0))

  //   this.initialRender = false

  //   if (wasDragging && activeSegment === sliceIndex) {
  //     infoBubble.considerShowing(
  //       false,
  //       streetSegment.current,
  //       INFO_BUBBLE_TYPE_SEGMENT
  //     )
  //   }

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
      if (oldVariant === undefined) throw new Error('oldVariant should be defined')
      setOldVariant(oldVariant)
    }
  }

  function handleSegmentMouseEnter (event: React.MouseEvent): void {
    // Immediately after a segment move action, react-dnd can incorrectly trigger this handler
    // on the segment that exists in the previous segment's spot. The bug is tracked here
    // (https://github.com/streetmix/streetmix/pull/1262) and here (https://github.com/react-dnd/react-dnd/issues/1102).
    // We work around this by setting `__BUGFIX_SUPPRESS_WRONG_MOUSEENTER_HANDLER` to `true`
    // immediately after the move action, which prevents us from firing this event handler one
    // time. This is suppressed once, then reset.
    if (_getBugfix()) {
      _resetBugfix()
      return
    }

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
    void dispatch(incrementSegmentWidth(
      position, // slice index
      false, // subtract
      finetune, // true if shift key is pressed
      RESIZE_TYPE_INCREMENT
    ))
  }

  function incrementWidth (position: number, finetune: boolean): void {
    void dispatch(incrementSegmentWidth(
      position, // slice index
      true, // add
      finetune, // true if shift key is pressed
      RESIZE_TYPE_INCREMENT
    ))
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
          void dispatch(clearSegmentsAction())
          infoBubble.hide()
          dispatch(addToast({
            message: formatMessage(
              'toast.all-segments-deleted',
              'All segments have been removed.'
            ),
            component: 'TOAST_UNDO'
          }))
        } else {
          infoBubble.hide()
          infoBubble.hideSegment()
          dispatch(addToast({
            message: formatMessage(
              'toast.segment-deleted',
              'The segment has been removed.'
            ),
            component: 'TOAST_UNDO'
          }))
          void dispatch(removeSegmentAction(sliceIndex))
        }
        break
      default:
        break
    }
  }, [])

  // Temporary no-ops
  function connectDragSource (stuff) {
    return stuff
  }

  function renderSegmentCanvas (variantType: string, nodeRef: React.RefObject<HTMLDivElement>): React.ReactNode {
    const isOldVariant = variantType === 'old'
    // const { segment, connectDragSource, connectDropTarget } = this.props

    // The segment ID is a string that uniquely identifies the segment
    // and can be used as a consistent and reliable seed for a PRNG
    const randSeed = segment.id

    return connectDragSource(
      <div className="segment-canvas-container" ref={drop}>
        <div ref={nodeRef}>
          <SegmentCanvas
            actualWidth={segment.width}
            type={segment.type}
            variantString={
              isOldVariant ? oldVariant : segment.variantString
            }
            randSeed={randSeed}
            elevation={segment.elevation}
          />
        </div>
      </div>
    )
  }

  const segmentInfo = getSegmentInfo(segment.type)

  // Get localized names from store, fall back to segment default names if translated
  // text is not found. TODO: port to react-intl/formatMessage later.
  const displayName =
    segment.label ?? getLocaleSegmentName(segment.type, segment.variantString)

  const average = getSegmentCapacity(segment, capacitySource)?.average
  const elementWidth = segment.width * TILE_SIZE

  const segmentStyle = {
    width: elementWidth + 'px',
    // In a street, certain segments have stacking priority over others (expressed as z-index).
    // Setting a z-index here will clobber a separate z-index (applied via CSS) when hovered by mouse pointer
    zIndex: isDragging ? 0 : segmentInfo.zIndex,
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
      <CSSTransition
        key="old-variant"
        in={!switchSegments}
        classNames="switching-away"
        timeout={250}
        onExited={handleSwitchSegments}
        unmountOnExit={true}
        nodeRef={oldRef}
      >
        {renderSegmentCanvas('old', oldRef)}
      </CSSTransition>
      <CSSTransition
        key="new-variant"
        in={switchSegments}
        classNames="switching-in"
        timeout={250}
        unmountOnExit={true}
        nodeRef={newRef}
      >
        {renderSegmentCanvas('new', newRef)}
      </CSSTransition>
      <div className="hover-bk" />
      {/* <EmptyDragPreview dragPreview={dragPreview} /> */}
    </div>
  )
}

//
// DragSource(Types.SEGMENT, segmentSource, collectDragSource),

export default Segment
