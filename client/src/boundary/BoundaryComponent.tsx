import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CSSTransition } from 'react-transition-group'

import { useSelector, useDispatch } from '~/src/store/hooks'
import {
  addBuildingFloor,
  removeBuildingFloor
} from '~/src/store/slices/street'
import { setActiveSegment } from '~/src/store/slices/ui'
import { usePrevious } from '~/src/util/usePrevious'
import {
  MAX_CANVAS_HEIGHT,
  GROUND_BASELINE_HEIGHT
} from '~/src/segments/constants'
import { getElevation } from '~/src/segments/view'
import { PopupContainer } from '../info_bubble/PopupContainer'
import {
  getBoundaryImageHeight,
  getBoundaryItem,
  drawBoundary
} from './boundary'
import './BoundaryComponent.css'

import type { BoundaryPosition } from '@streetmix/types'

/**
 * Creates building canvas element to draw on
 */
function createBoundaryCanvas (
  el: HTMLElement,
  position: BoundaryPosition,
  variant: string,
  elevation: number,
  floors: number,
  shadeIn: boolean,
  scale: number
): void {
  const elementWidth = el.offsetWidth

  // Bail if there is no variant
  // Currently this is an escape hatch for an error on mobile devices
  if (!variant) return

  // Determine physical dimensions
  const item = getBoundaryItem(variant)
  const overhangWidth =
    typeof item.overhangWidth === 'number' ? item.overhangWidth : 0
  const itemHeight = getBoundaryImageHeight(variant, position, floors)

  // Determine canvas dimensions from physical dimensions
  const width = elementWidth + overhangWidth
  const height = Math.min(
    MAX_CANVAS_HEIGHT,
    itemHeight + getElevation(elevation)
  )

  // Create canvas
  const canvasEl = document.createElement('canvas')
  const oldCanvasEl = el.querySelector('canvas')

  canvasEl.width = width * scale
  canvasEl.height = (height + GROUND_BASELINE_HEIGHT) * scale
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
    position,
    variant,
    elevation,
    floors,
    width,
    height,
    0,
    1.0,
    scale,
    shadeIn
  )
}

interface BoundaryProps {
  position: BoundaryPosition
  width: number
  updatePerspective: (el: HTMLElement | null) => void
}

function Boundary ({
  position,
  width,
  updatePerspective
}: BoundaryProps): React.ReactElement {
  const street = useSelector((state) => state.street)
  const activeSegment = useSelector((state) => state.ui.activeSegment)
  const leftBoundaryEditable = useSelector(
    (state) => state.flags.EDIT_BOUNDARY_LEFT.value
  )
  const rightBoundaryEditable = useSelector(
    (state) => state.flags.EDIT_BOUNDARY_RIGHT.value
  )
  const scale = useSelector((state) => state.system.devicePixelRatio)

  const dispatch = useDispatch()

  const [oldElementEnter, setOldElementEnter] = useState(true)
  const [newElementEnter, setNewElementEnter] = useState(false)
  const [switchElements, setSwitchElements] = useState(false)

  const newEl = useRef<HTMLElement>(null)
  const oldEl = useRef<HTMLElement>(null)

  // These refs are a workaround for CSSTransition's dependence on
  // findDOMNode, which is deprecated.
  const newRef = useRef(null)
  const oldRef = useRef(null)

  const isEditable = !(
    (!leftBoundaryEditable && position === 'left') ||
    (!rightBoundaryEditable && position === 'right')
  )
  const variant = street.boundary[position].variant
  const floors = street.boundary[position].floors
  const elevation = street.boundary[position].elevation
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
    if (newEl.current === null) return

    // Animate only if variant changes within the same street ID.
    if (prevState?.streetId === street.id && prevState?.variant !== variant) {
      handleSwitchElements()
    } else {
      createBoundaryCanvas(
        newEl.current,
        position,
        variant,
        elevation,
        floors,
        isOverflowed,
        scale
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, floors, isOverflowed, width, elevation])

  // Effect runs when boundary elements switch in/out
  useEffect(() => {
    if (newEl.current === null) return

    updatePerspective(oldEl.current)
    updatePerspective(newEl.current)
    createBoundaryCanvas(
      newEl.current,
      position,
      variant,
      elevation,
      floors,
      isOverflowed,
      scale
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
    const el = newEl.current

    if (el === null) return
    if (!isEditable) return

    dispatch(setActiveSegment(position))
    document.addEventListener('keydown', handleKeyDown)
  }

  function handleElementMouseLeave (): void {
    const el = newEl.current

    if (el === null) return
    if (!isEditable) return

    dispatch(setActiveSegment(null))
    document.removeEventListener('keydown', handleKeyDown)
  }

  function changeRefs (
    ref: HTMLElement | null,
    isPreviousElement: boolean
  ): void {
    if (!switchElements && !isPreviousElement) return

    if (switchElements && isPreviousElement) {
      oldEl.current = ref
    } else {
      newEl.current = ref
    }
  }

  function handleSwitchElements (): void {
    setSwitchElements((s) => !s)
    setNewElementEnter((s) => !s)
    setOldElementEnter((s) => !s)
  }

  function renderBoundary (
    boundary: string,
    nodeRef: React.RefObject<null>,
    elevation: number,
    width: number
  ): React.ReactElement {
    const isPreviousElement = boundary === 'old'

    const widthStyle = {
      [position]: `-${width}px`,
      width: width + 'px'
    }
    // NOTE - this still renders "higher" because of the "ground plane" on sprites
    const elevationStyle = {
      height: `${GROUND_BASELINE_HEIGHT + getElevation(elevation)}px`
    }

    const classNames = ['street-section-boundary']

    // Add a class name for boundary position
    classNames.push(`boundary-${position}`)

    if (isPreviousElement && activeSegment === position) {
      classNames.push('active')
    }

    // Outer wrapping div is a workaround for CSSTransition's dependence on
    // findDOMNode, which needs a nodeRef to be manually attached to a DOM
    // node. This is wrapping the existing <section> to preserve existing
    // node switching functionality
    return (
      <div className={classNames.join(' ')} style={widthStyle} ref={nodeRef}>
        <PopupContainer type="boundary" position={position}>
          <button>
            <section
              ref={(ref) => {
                changeRefs(ref, isPreviousElement)
              }}
              onMouseEnter={handleElementMouseEnter}
              onMouseLeave={handleElementMouseLeave}
            />
            <div className="active-bg" />
            <div className="boundary-dirt" style={elevationStyle} />
          </button>
        </PopupContainer>
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
        {renderBoundary('old', oldRef, elevation, width)}
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
        {renderBoundary('new', newRef, elevation, width)}
      </CSSTransition>
    </>
  )
}

export default Boundary
