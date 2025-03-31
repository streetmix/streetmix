import React, { useEffect, useRef } from 'react'
import { useDrop } from 'react-dnd'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { useSelector } from '~/src/store/hooks'
import { usePrevious } from '~/src/util/usePrevious'
import Segment from '../segments/Segment'
import {
  TILE_SIZE,
  DRAGGING_MOVE_HOLE_WIDTH,
  DRAGGING_TYPE_RESIZE
} from '../segments/constants'
import { cancelSegmentResizeTransitions } from '../segments/resizing'
import {
  makeSpaceBetweenSegments,
  isSegmentWithinCanvas,
  createStreetDropTargetSpec
} from '../segments/drag_and_drop'

interface StreetEditableProps {
  resizeType?: number
  setBuildingWidth: (node: React.ReactElement) => void
  updatePerspective: (el: HTMLDivElement) => void
  draggingType?: number
}

function StreetEditable (props: StreetEditableProps): React.ReactElement {
  const { resizeType, setBuildingWidth, updatePerspective, draggingType } =
    props
  const street = useSelector((state) => state.street)
  const draggingState = useSelector((state) => state.ui.draggingState)

  // Internal "state", but does not affect renders, so it is not React state
  const withinCanvas = useRef<boolean>(false)
  const streetSectionEditable = useRef<HTMLDivElement>(null)

  // According to "rule of hooks", useRef() must not be called in a loop
  // This is a top-level container to manage a list of refs as a workaround
  // for CSSTransition's reliance on deprecated findDOMNode
  const childRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({})

  // Keep previous state for comparisons (ported from legacy behavior)
  const prevProps = usePrevious({
    resizeType,
    draggingType,
    street,
    draggingState
  })

  // Set up drop target
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [collectedProps, drop] = useDrop(() => createStreetDropTargetSpec(street, streetSectionEditable))

  useEffect(() => {
    const dragEvents = ['dragover', 'touchmove']
    if (!prevProps?.draggingState && draggingState) {
      dragEvents.forEach((type) => {
        window.addEventListener(type, updateWithinCanvas)
      })
    } else if (prevProps?.draggingState && !draggingState) {
      dragEvents.forEach((type) => {
        window.removeEventListener(type, updateWithinCanvas)
      })
    }

    // Cleanup
    return () => {
      dragEvents.forEach((type) => {
        window.removeEventListener(type, updateWithinCanvas)
      })
    }
  }, [draggingState])

  useEffect(() => {
    if (prevProps === null || prevProps === undefined) return
    if (
      (resizeType !== undefined && prevProps.resizeType !== undefined) ??
      (prevProps.draggingType === DRAGGING_TYPE_RESIZE &&
        draggingType !== undefined)
    ) {
      setBuildingWidth(streetSectionEditable.current)
    }
  }, [resizeType, draggingType])

  useEffect(() => {
    if (
      prevProps?.street.id !== street.id ||
      prevProps?.street.width !== street.width
    ) {
      cancelSegmentResizeTransitions()
    }
  }, [street.id, street.width])

  function updateWithinCanvas (event): void {
    const newValue = isSegmentWithinCanvas(
      event,
      streetSectionEditable.current
    )

    if (newValue) {
      document.body.classList.remove('not-within-canvas')
    } else {
      document.body.classList.add('not-within-canvas')
    }

    if (withinCanvas.current !== newValue) {
      withinCanvas.current = newValue
    }
  }

  function handleSwitchSliceAway (el: HTMLDivElement, sliceIndex: number): void {
    // Targeting first child node instead of el because of wrapper div workaround
    // for CSSTransition
    const childNode = el.firstChild as HTMLDivElement
    if (childNode === null) return

    const left = calculateSlicePosition(sliceIndex)
    childNode.style.left = `${left}px`

    updatePerspective(childNode)
  }

  function calculateSlicePosition (sliceIndex: number): number {
    const { segments, remainingWidth } = street

    let currPos = 0

    for (let i = 0; i < sliceIndex; i++) {
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

    if (draggingState && withinCanvas.current) {
      mainLeft -= DRAGGING_MOVE_HOLE_WIDTH
      const spaceBetweenSegments = makeSpaceBetweenSegments(
        sliceIndex,
        draggingState
      )
      return mainLeft + currPos + spaceBetweenSegments
    } else {
      return mainLeft + currPos
    }
  }

  function onExitAnimations (child: React.ReactElement): React.ReactElement {
    return React.cloneElement(child, {
      exit: !street.immediateRemoval
    })
  }

  function renderStreetSegments (): React.ReactNode {
    const { segments, units, immediateRemoval } = street
    const streetId = street.id

    return segments.map((segment, i) => {
      const segmentLeft = calculateSlicePosition(i)
      const key = `${streetId}.${segment.id}`
      // Refs are created with createRef and then stored in parent `refs`
      const ref = React.createRef<HTMLDivElement>()
      childRefs.current[key] = ref

      const segmentEl = (
        <CSSTransition
          key={key}
          timeout={250}
          classNames="switching-away"
          exit={!immediateRemoval}
          onExit={() => {
            if (ref.current === null) return
            handleSwitchSliceAway(ref.current, i)
          }}
          unmountOnExit={true}
          nodeRef={ref}
        >
          {/* This wrapper element is a workaround for CSSTransition depending on
              findDOMNode, which is deprecated. We just need a DOM element to
              attach a ref to. This introduces a lot of bugs, unfortunately. */}
          <div ref={ref}>
            <Segment
              sliceIndex={i}
              segment={{ ...segment }}
              units={units}
              segmentLeft={segmentLeft}
            />
          </div>
        </CSSTransition>
      )

      return segmentEl
    })
  }

  const style = {
    width: street.width * TILE_SIZE + 'px'
  }

  return (
    <div
      id="street-section-editable"
      key={street.id}
      style={style}
      ref={streetSectionEditable}
    >
      <div style={{ width: '100%', height: '100%' }} ref={drop}>
        <TransitionGroup
          key={street.id}
          component={null}
          enter={false}
          childFactory={onExitAnimations}
        >
          {renderStreetSegments()}
        </TransitionGroup>
      </div>
    </div>
  )
}

export default StreetEditable
