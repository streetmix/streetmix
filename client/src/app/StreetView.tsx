import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useSelector } from '~/src/store/hooks'
import { usePrevious } from '~/src/util/usePrevious'
import { Boundary } from '~/src/boundary'
import { PopupContainerGroup } from '~/src/info_bubble/PopupContainer'
import { SeaLevel } from '~/src/plugins/coastmix'
import ResizeGuides from '../segments/ResizeGuides'
import EmptySegmentContainer from '../segments/EmptySegmentContainer'
import { animate, getElAbsolutePos } from '../util/helpers'
import { MAX_CUSTOM_STREET_WIDTH } from '../streets/constants'
import {
  TILE_SIZE,
  DRAGGING_TYPE_RESIZE,
  BUILDING_SPACE
} from '../segments/constants'
import { updateStreetMargin } from '../segments/resizing'
import SkyBox from '../sky/SkyBox'
import ScrollIndicators from './ScrollIndicators'
import StreetEditable from './StreetEditable'
import './StreetView.css'

const SEGMENT_RESIZED = 1
const STREETVIEW_RESIZED = 2

/**
 * Based on street width and scroll position, determine how many
 * left and right "scroll indicator" arrows to display. This number
 * is calculated as the street scrolls and stored in state.
 */
function calculateScrollIndicators (
  el: HTMLDivElement | null,
  streetWidth: number
): { left: number; right: number } | undefined {
  if (el === null) return

  let scrollIndicatorsLeft
  let scrollIndicatorsRight

  if (el.scrollWidth <= el.offsetWidth) {
    scrollIndicatorsLeft = 0
    scrollIndicatorsRight = 0
  } else {
    const left = el.scrollLeft / (el.scrollWidth - el.offsetWidth)

    // TODO const off max width street
    let posMax = Math.round((streetWidth / MAX_CUSTOM_STREET_WIDTH) * 6)
    if (posMax < 2) {
      posMax = 2
    }

    scrollIndicatorsLeft = Math.round(posMax * left)
    if (left > 0 && scrollIndicatorsLeft === 0) {
      scrollIndicatorsLeft = 1
    }
    if (left < 1.0 && scrollIndicatorsLeft === posMax) {
      scrollIndicatorsLeft = posMax - 1
    }
    scrollIndicatorsRight = posMax - scrollIndicatorsLeft
  }

  return {
    left: scrollIndicatorsLeft,
    right: scrollIndicatorsRight
  }
}

function StreetView (): React.ReactElement {
  const [scrollIndicators, setScrollIndicators] = useState({
    left: 0,
    right: 0
  })
  const [scrollPos, setScrollPos] = useState(0)
  const [resizeType, setResizeType] = useState<number | null>(null)
  const [boundaryWidth, setBoundaryWidth] = useState(0)

  const sectionEl = useRef<HTMLDivElement>(null)
  const sectionCanvasEl = useRef<HTMLCanvasElement>(null)

  const street = useSelector((state) => state.street)
  const draggingType = useSelector((state) => state.ui.draggingType)

  // Keep previous state for comparisons (ported from legacy behavior)
  const prevState = usePrevious({
    boundaryWidth,
    resizeType,
    street
  })

  const onResize = useCallback((): number | undefined => {
    if (!sectionCanvasEl.current) return

    const viewportWidth = window.innerWidth
    const streetWidth = street.width * TILE_SIZE
    let streetSectionCanvasLeft =
      (viewportWidth - streetWidth) / 2 - BUILDING_SPACE

    if (streetSectionCanvasLeft < 0) {
      streetSectionCanvasLeft = 0
    }

    sectionCanvasEl.current.style.width = streetWidth + 'px'
    sectionCanvasEl.current.style.left = streetSectionCanvasLeft + 'px'

    return STREETVIEW_RESIZED
  }, [street.width])

  const handleStreetResize = useCallback(() => {
    // Place all scroll-based positioning effects inside of a "raf"
    // callback for better performance.
    window.requestAnimationFrame(() => {
      const resizeType = onResize()
      const scrollIndicators = calculateScrollIndicators(
        sectionEl.current,
        street.width
      )

      if (resizeType !== undefined) {
        setResizeType(resizeType)
      }
      if (scrollIndicators !== undefined) {
        setScrollIndicators(scrollIndicators)
      }
    })
  }, [onResize, street.width])

  useEffect(() => {
    handleStreetResize()
    window.addEventListener('resize', handleStreetResize)

    return () => {
      window.removeEventListener('resize', handleStreetResize)
    }
  }, [handleStreetResize])

  useEffect(() => {
    handleStreetResize()
  }, [handleStreetResize, street.width])

  const updateScrollLeft = useCallback(
    (deltaX?: number): void => {
      if (!sectionEl.current) return

      let scrollLeft = sectionEl.current.scrollLeft

      if (deltaX !== undefined) {
        scrollLeft += deltaX
      } else {
        const streetWidth = street.width * TILE_SIZE
        const currBuildingSpace = boundaryWidth ?? BUILDING_SPACE
        scrollLeft =
          (streetWidth + currBuildingSpace * 2 - window.innerWidth) / 2
      }

      sectionEl.current.scrollLeft = scrollLeft
    },
    [boundaryWidth, street.width]
  )

  useEffect(() => {
    // Two cases where scrollLeft might have to be updated:
    // 1) Building width has changed due to segments being dragged in/out of
    //    StreetView or being resized
    // 2) Street width changed causing remainingWidth to change, but not
    //    building width
    if (
      prevState?.boundaryWidth !== boundaryWidth ||
      (prevState?.resizeType === STREETVIEW_RESIZED && resizeType !== null)
    ) {
      const deltaX = boundaryWidth - (prevState?.boundaryWidth ?? 0)

      // If segment was resized (either dragged or incremented), update
      // scrollLeft to make up for margin change.
      if (
        prevState?.resizeType === SEGMENT_RESIZED ||
        prevState?.resizeType === resizeType
      ) {
        updateScrollLeft(deltaX)
      } else if (prevState?.resizeType === STREETVIEW_RESIZED) {
        // If StreetView was resized/changed (either viewport, streetWidth,
        // or street itself), update scrollLeft to center street view and
        // check if margins need to be updated.
        updateScrollLeft()
        resizeStreetExtent(SEGMENT_RESIZED, true)
      }
    }
  }, [boundaryWidth, resizeType, updateScrollLeft])

  useEffect(() => {
    // Updating margins when segment is resized by dragging is handled in resizing.js
    if (
      prevState?.street.occupiedWidth !== street.occupiedWidth &&
      draggingType !== DRAGGING_TYPE_RESIZE
    ) {
      // Check if occupiedWidth changed because segment was changed (resized, added, or removed)
      // or because gallery street was changed, and update accordingly.
      const resizeType =
        street.id !== prevState?.street.id
          ? STREETVIEW_RESIZED
          : SEGMENT_RESIZED
      const dontDelay = resizeType === STREETVIEW_RESIZED
      resizeStreetExtent(resizeType, dontDelay)
    }
  }, [street.occupiedWidth])

  function resizeStreetExtent (resizeType: number, dontDelay: boolean): void {
    const marginUpdated = updateStreetMargin(
      sectionCanvasEl.current,
      sectionEl.current,
      dontDelay
    )

    if (marginUpdated) {
      setResizeType(resizeType)
    }
  }

  /**
   * Event handler for street scrolling.
   */
  function handleStreetScroll (event: React.UIEvent<HTMLDivElement>): void {
    // Place all scroll-based positioning effects inside of a "raf"
    // callback for better performance.
    window.requestAnimationFrame(() => {
      const scrollIndicators = calculateScrollIndicators(
        sectionEl.current,
        street.width
      )

      if (scrollIndicators !== undefined) {
        setScrollIndicators(scrollIndicators)
        setScrollPos(getStreetScrollPosition())
      }
    })
  }

  function scrollStreet (left: boolean, far = false): void {
    const el = sectionEl.current
    if (!el) return

    let newScrollLeft

    if (left) {
      if (far) {
        newScrollLeft = 0
      } else {
        newScrollLeft = el.scrollLeft - el.offsetWidth * 0.5
      }
    } else {
      if (far) {
        newScrollLeft = el.scrollWidth - el.offsetWidth
      } else {
        newScrollLeft = el.scrollLeft + el.offsetWidth * 0.5
      }
    }

    animate(el, { scrollLeft: newScrollLeft }, 300)
  }

  function getBoundaryWidth (el: HTMLDivElement | null): void {
    if (el === null) return
    const pos = getElAbsolutePos(el)

    let width = pos[0]
    if (width < 0) {
      width = 0
    }

    setBoundaryWidth(width)
    setResizeType(null)
  }

  function getStreetScrollPosition (): number {
    return sectionEl.current?.scrollLeft ?? 0
  }

  /**
   * Updates a segment or building's CSS `perspective-origin` property according
   * to its current position in the street and on the screen, which is used
   * when it animates in or out. Because this reads and writes to DOM, only call
   * this function after a render. Do not set state or call other side effects
   * from this function.
   */
  function updatePerspective (el: HTMLElement | null): void {
    if (el === null) return

    const pos = getElAbsolutePos(el)
    const scrollPos = getStreetScrollPosition()
    const perspective = -(pos[0] - scrollPos - window.innerWidth / 2)

    el.style.perspectiveOrigin = perspective / 2 + 'px 50%'
  }

  return (
    <>
      <section
        id="street-section-outer"
        onScroll={handleStreetScroll}
        ref={sectionEl}
      >
        <section id="street-section-inner">
          <PopupContainerGroup>
            <section id="street-section-canvas" ref={sectionCanvasEl}>
              <Boundary
                position="left"
                width={boundaryWidth}
                updatePerspective={updatePerspective}
              />
              <StreetEditable
                resizeType={resizeType}
                setBoundaryWidth={getBoundaryWidth}
                updatePerspective={updatePerspective}
                draggingType={draggingType}
              />
              <Boundary
                position="right"
                width={boundaryWidth}
                updatePerspective={updatePerspective}
              />
              <ResizeGuides />
              <EmptySegmentContainer />
              <SeaLevel scrollPos={scrollPos} />
              <div className="street-section-ground" />
            </section>
          </PopupContainerGroup>
          <ScrollIndicators
            left={scrollIndicators.left}
            right={scrollIndicators.right}
            scrollStreet={scrollStreet}
          />
        </section>
      </section>
      <SkyBox scrollPos={scrollPos} />
    </>
  )
}

export default StreetView
