import { useCallback, useEffect, useRef, useState } from 'react'

import { useSelector } from '~/src/store/hooks.js'
import { usePrevious } from '~/src/util/usePrevious.js'
import { Boundary } from '~/src/boundary/index.js'
import { PopupContainerGroup } from '~/src/info_bubble/PopupContainer.js'
import { SeaLevel } from '~/src/plugins/coastmix/index.js'
import ResizeGuides from '../segments/ResizeGuides.js'
import { EmptySegmentContainer } from '../segments/EmptySegmentContainer.js'
import { animate, getElAbsolutePos } from '../util/helpers.js'
import { MAX_CUSTOM_STREET_WIDTH } from '../streets/constants.js'
import {
  TILE_SIZE,
  DRAGGING_TYPE_RESIZE,
  BUILDING_SPACE,
} from '../segments/constants.js'
import { updateStreetMargin } from '../segments/resizing.js'
import { SkyBox } from '../sky/SkyBox/index.js'
import { ScrollIndicators } from './ScrollIndicators.js'
import StreetEditable from './StreetEditable.js'
import './StreetView.css'

const SEGMENT_RESIZED = 1
const STREETVIEW_RESIZED = 2

const INDICATOR_ARROWS_MIN = 2
const INDICATOR_ARROWS_MAX = 6

/**
 * Based on street width and scroll position, determine how many
 * left and right "scroll indicator" arrows to display. This number
 * is calculated as the street scrolls and stored in state.
 */
function calculateScrollIndicators(
  el: HTMLDivElement | null,
  streetWidth: number
): { left: number; right: number } | undefined {
  if (el === null) return

  let arrowsLeft
  let arrowsRight

  // 1px buffer on the offsetWidth to handle some rounding issues
  // where scrollWidth is consistently 1px wider
  if (el.scrollWidth <= el.offsetWidth + 1) {
    arrowsLeft = 0
    arrowsRight = 0
  } else {
    // A percentage (between 0 - 1) of how far scrolled
    // 0 = all the way to the left,
    // 1 = all the way to the right
    // It is possible to scroll close to 1, but not actually hit it
    // (not sure why that happens...)
    const left = el.scrollLeft / (el.scrollWidth - el.offsetWidth)

    // The wider the street, the more arrows will be displayed
    // There will be at minimum 2 arrows and a maximum of 6
    const totalArrows = Math.max(
      Math.round(
        (streetWidth / MAX_CUSTOM_STREET_WIDTH) * INDICATOR_ARROWS_MAX
      ),
      INDICATOR_ARROWS_MIN
    )

    // Split the arrows between left and right sides, based on the percentage
    // distance scrolled. As long as we haven't scrolled fully to the left,
    // there will always be 1 arrow on the left side.
    arrowsLeft = Math.round(totalArrows * left)
    if (left > 0 && arrowsLeft === 0) {
      arrowsLeft = 1
    }
    arrowsRight = totalArrows - arrowsLeft
  }

  return {
    left: arrowsLeft,
    right: arrowsRight,
  }
}

function StreetView() {
  const [scrollIndicators, setScrollIndicators] = useState({
    left: 0,
    right: 0,
  })
  const [scrollPos, setScrollPos] = useState(0)
  const [resizeType, setResizeType] = useState<number>()
  const [boundaryWidth, setBoundaryWidth] = useState(BUILDING_SPACE)

  const sectionEl = useRef<HTMLDivElement>(null)
  const sectionCanvasEl = useRef<HTMLCanvasElement>(null)

  const street = useSelector((state) => state.street)
  const draggingType = useSelector((state) => state.ui.draggingType)

  // Keep previous state for comparisons (ported from legacy behavior)
  const prevState = usePrevious({
    boundaryWidth,
    resizeType,
    street,
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
        const currBuildingSpace = boundaryWidth
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
      (prevState?.resizeType === STREETVIEW_RESIZED && resizeType !== undefined)
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
  }, [boundaryWidth, resizeType, updateScrollLeft, prevState])

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
  }, [street, prevState, draggingType])

  function resizeStreetExtent(resizeType: number, dontDelay: boolean): void {
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
  function handleStreetScroll(_event: React.UIEvent<HTMLDivElement>): void {
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

  function scrollStreet(left: boolean, far = false): void {
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

  function getBoundaryWidth(el: HTMLDivElement | null): void {
    if (el === null) return
    const pos = getElAbsolutePos(el)

    let width = pos[0]
    if (width < 0) {
      width = 0
    }

    setBoundaryWidth(width)
    setResizeType(undefined)
  }

  function getStreetScrollPosition(): number {
    return sectionEl.current?.scrollLeft ?? 0
  }

  /**
   * Updates a segment or building's CSS `perspective-origin` property according
   * to its current position in the street and on the screen, which is used
   * when it animates in or out. Because this reads and writes to DOM, only call
   * this function after a render. Do not set state or call other side effects
   * from this function.
   */
  function updatePerspective(el: HTMLElement | null): void {
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
              <SeaLevel boundaryWidth={boundaryWidth} scrollPos={scrollPos} />
              <div className="street-section-ground" />
            </section>
          </PopupContainerGroup>
        </section>
      </section>
      <SkyBox scrollPos={scrollPos} />
      <ScrollIndicators
        left={scrollIndicators.left}
        right={scrollIndicators.right}
        scrollStreet={scrollStreet}
      />
    </>
  )
}

export default StreetView
