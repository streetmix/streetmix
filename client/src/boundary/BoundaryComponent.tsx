import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CSSTransition } from 'react-transition-group'

import { useSelector, useDispatch } from '~/src/store/hooks'
import {
  addBuildingFloor,
  removeBuildingFloor
} from '~/src/store/slices/street'
import { usePrevious } from '~/src/util/usePrevious'
import {
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from '../info_bubble/constants'
import { infoBubble } from '../info_bubble/info_bubble'
import { BOUNDARY_LEFT_POSITION, BOUNDARY_RIGHT_POSITION } from './constants'
import {
  getBoundaryImageHeight,
  getBoundaryItem,
  drawBoundary,
  GROUND_BASELINE_HEIGHT
} from './boundary'

import type { BoundaryPosition } from '@streetmix/types'

const MAX_CANVAS_HEIGHT = 2048

/**
 * Creates building canvas element to draw on
 */
function createBoundaryCanvas (
  el: HTMLElement,
  variant: string,
  position: BoundaryPosition,
  floors: number,
  shadeIn: boolean,
  dpi: number
): void {
  const elementWidth = el.offsetWidth

  // Determine physical dimensions
  const item = getBoundaryItem(variant)
  const overhangWidth =
    typeof item.overhangWidth === 'number' ? item.overhangWidth : 0
  const itemHeight = getBoundaryImageHeight(variant, position, floors)

  // Determine canvas dimensions from physical dimensions
  const width = elementWidth + overhangWidth
  const height = Math.min(MAX_CANVAS_HEIGHT, itemHeight)

  // Create canvas
  const canvasEl = document.createElement('canvas')
  const oldCanvasEl = el.querySelector('canvas')

  canvasEl.width = width * dpi
  canvasEl.height = (height + GROUND_BASELINE_HEIGHT) * dpi
  canvasEl.style.width = width + 'px'
  canvasEl.style.height = height + GROUND_BASELINE_HEIGHT + 'px'

  // Replace previous canvas if present, otherwise append a new one
  if (oldCanvasEl) {
    el.replaceChild(canvasEl, oldCanvasEl)
  } else {
    el.appendChild(canvasEl)
  }

  const ctx = canvasEl.getContext('2d')

  if (ctx === null) return

  drawBoundary(
    ctx,
    variant,
    floors,
    position,
    width,
    height,
    0,
    1.0,
    dpi,
    shadeIn
  )
}

interface BoundaryProps {
  position: BoundaryPosition
  boundaryWidth: number
  updatePerspective: (el: HTMLElement | null) => void
}

function Boundary ({
  position,
  boundaryWidth,
  updatePerspective
}: BoundaryProps): React.ReactElement {
  const street = useSelector((state) => state.street)
  const activeSegment = useSelector((state) =>
    typeof state.ui.activeSegment === 'string' ? state.ui.activeSegment : null
  )
  const leftBoundaryEditable = useSelector(
    (state) => state.flags.EDIT_BOUNDARY_LEFT.value
  )
  const rightBoundaryEditable = useSelector(
    (state) => state.flags.EDIT_BOUNDARY_RIGHT.value
  )
  const dpi = useSelector((state) => state.system.devicePixelRatio)

  const dispatch = useDispatch()

  const [oldElementEnter, setOldElementEnter] = useState(true)
  const [newElementEnter, setNewElementEnter] = useState(false)
  const [switchElements, setSwitchElements] = useState(false)

  const currentEl = useRef<HTMLElement>(null)
  const previousEl = useRef<HTMLElement>(null)

  // These refs are a workaround for CSSTransition's dependence on
  // findDOMNode, which is deprecated.
  const newRef = useRef(null)
  const oldRef = useRef(null)

  const isEditable = !(
    (!leftBoundaryEditable && position === BOUNDARY_LEFT_POSITION) ||
    (!rightBoundaryEditable && position === BOUNDARY_RIGHT_POSITION)
  )
  const variant = street.boundary[position].variant
  const floors = street.boundary[position].floors
  const isOverflowed = street.remainingWidth < 0

  // Keep previous state for comparisons (ported from legacy behavior)
  const prevState = usePrevious({
    streetId: street.id,
    variant
  })

  // `event` type is not a React event because listener is attached through DOM
  // We need to define a callback so React can properly clean up event handlers
  const handleKeyDown = useCallback((event: KeyboardEvent): void => {
    if (!isEditable) return

    const negative = event.key === '-'

    // Plus (+) may only triggered with shift key, so also check if
    // the same physical key (Equal) is pressed
    const positive = event.key === '+' || event.code === 'Equal'

    const variant = street.boundary[position].variant
    const hasFloors = getBoundaryItem(variant).hasFloors

    if (hasFloors) {
      if (positive) {
        dispatch(addBuildingFloor(position))
      } else if (negative) {
        dispatch(removeBuildingFloor(position))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // For certain changes, redraw canvas
  useEffect(() => {
    if (currentEl.current === null) return

    // Animate only if variant changes within the same street ID.
    if (prevState?.streetId === street.id && prevState?.variant !== variant) {
      handleSwitchElements()
    } else {
      createBoundaryCanvas(
        currentEl.current,
        variant,
        position,
        floors,
        isOverflowed,
        dpi
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, floors, isOverflowed, boundaryWidth])

  // Effect runs when boundary elements switch in/out
  useEffect(() => {
    if (currentEl.current === null) return

    updatePerspective(previousEl.current)
    updatePerspective(currentEl.current)
    createBoundaryCanvas(
      currentEl.current,
      variant,
      position,
      floors,
      isOverflowed,
      dpi
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchElements])

  // Cleanup effect
  useEffect(() => {
    // Event handler is only added on mouseover, but definitely remove if
    // component is unmounted.
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  function handleElementMouseEnter (event: React.MouseEvent): void {
    const el = currentEl.current

    if (el === null) return
    if (!isEditable) return

    document.addEventListener('keydown', handleKeyDown)

    let type

    if (position === BOUNDARY_LEFT_POSITION) {
      type = INFO_BUBBLE_TYPE_LEFT_BUILDING
    } else if (position === BOUNDARY_RIGHT_POSITION) {
      type = INFO_BUBBLE_TYPE_RIGHT_BUILDING
    }

    infoBubble.considerShowing(event, el, type)
  }

  function handleElementMouseLeave (): void {
    const el = currentEl.current

    if (el === null) return
    if (!isEditable) return

    document.removeEventListener('keydown', handleKeyDown)

    if (infoBubble.considerSegmentEl === el) {
      infoBubble.dontConsiderShowing()
    }
  }

  function changeRefs (
    ref: HTMLElement | null,
    isPreviousElement: boolean
  ): void {
    if (!switchElements && !isPreviousElement) return

    if (switchElements && isPreviousElement) {
      previousEl.current = ref
    } else {
      currentEl.current = ref
    }
  }

  function handleSwitchElements (): void {
    setSwitchElements((s) => !s)
    setNewElementEnter((s) => !s)
    setOldElementEnter((s) => !s)
  }

  function renderBoundary (
    boundary: string,
    nodeRef: React.RefObject<null>
  ): React.ReactElement {
    const isPreviousElement = boundary === 'old'

    const style = {
      [position]: `-${boundaryWidth}px`,
      width: boundaryWidth + 'px'
    }

    const classNames = ['street-section-boundary']

    // Add a class name for boundary position
    classNames.push(`street-segment-boundary-${position}`)

    if (isPreviousElement && activeSegment === position) {
      classNames.push('hover')
    }

    // Outer wrapping div is a workaround for CSSTransition's dependence on
    // findDOMNode, which needs a nodeRef to be manually attached to a DOM
    // node. This is wrapping the existing <section> to preserve existing
    // node switching functionality
    return (
      <div className={classNames.join(' ')} style={style} ref={nodeRef}>
        <section
          style={{ width: '100%', height: '100%', perspective: '400px' }}
          ref={(ref) => {
            changeRefs(ref, isPreviousElement)
          }}
          onMouseEnter={handleElementMouseEnter}
          onMouseLeave={handleElementMouseLeave}
        >
          <div className="hover-bk" />
        </section>
      </div>
    )
  }

  return (
    <>
      <CSSTransition
        key="old-boundary"
        in={oldElementEnter}
        classNames="switching-away"
        timeout={250}
        unmountOnExit
        nodeRef={oldRef}
      >
        {renderBoundary('old', oldRef)}
      </CSSTransition>
      <CSSTransition
        key="new-boundary"
        in={newElementEnter}
        classNames="switching-in"
        timeout={250}
        onEntered={handleSwitchElements}
        unmountOnExit
        nodeRef={newRef}
      >
        {renderBoundary('new', newRef)}
      </CSSTransition>
    </>
  )
}

export default Boundary
