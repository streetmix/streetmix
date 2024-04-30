import React, { useEffect, useRef } from 'react'
import debounce from 'just-debounce-it'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import {
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '../segments/constants'
import { getSegmentEl } from '../segments/view'
import { loseAnyFocus } from '../util/focus'
import { getElAbsolutePos } from '../util/helpers'
import {
  setInfoBubbleMouseInside,
  updateHoverPolygon
} from '../store/slices/infoBubble'
import InfoBubbleControls from './InfoBubbleControls'
import InfoBubbleHeader from './InfoBubbleHeader'
import InfoBubbleLower from './InfoBubbleLower'
import { infoBubble } from './info_bubble'
import {
  INFO_BUBBLE_TYPE_SEGMENT,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from './constants'
import './InfoBubble.scss'

import type { BuildingPosition } from '@streetmix/types'

const INFO_BUBBLE_MARGIN_BUBBLE = 20
const INFO_BUBBLE_MARGIN_MOUSE = 10
const DESCRIPTION_HOVER_POLYGON_MARGIN = 200
const MIN_TOP_MARGIN_FROM_VIEWPORT = 150
// The menu bar has extended to 30px margin, but we can't change
// this because a lesser number will currently cause the description
// panel to potentially be offscreen.
const MIN_SIDE_MARGIN_FROM_VIEWPORT = 50
const HOVER_POLYGON_DEBOUNCE = 50

function InfoBubble (): React.ReactElement {
  const visible = useSelector((state) => state.infoBubble.visible)
  const descriptionVisible = useSelector(
    (state) => state.infoBubble.descriptionVisible
  )
  const mouseInside = useSelector((state) => state.infoBubble.mouseInside)
  const position = useSelector((state) => state.ui.activeSegment)
  const dispatch = useDispatch()

  const el = useRef<HTMLDivElement>(null)
  const streetOuterEl = useRef<HTMLDivElement | null>(null)

  const segmentEl = getSegmentEl(position)
  const type = getTypeFromPosition(position)

  useEffect(() => {
    // Register keyboard shortcuts to hide info bubble
    // Only hide if it's currently visible, and if the
    // description is NOT visible. (If the description
    // is visible, the escape key should hide that first.)
    registerKeypress('esc', { condition: isInfoBubbleVisible }, handleHide)

    return () => {
      deregisterKeypress('esc', handleHide)
    }
  }, [])

  useEffect(() => {
    // This listener hides the info bubble when the mouse leaves the
    // document area. Do not normalize it to a pointerleave event
    // because it doesn't make sense for other pointer types
    document.addEventListener('mouseleave', hide)

    return () => {
      document.removeEventListener('mouseleave', hide)
    }
  }, [])

  useEffect(() => {
    // Cache reference to this exterior element. This has to be set after
    // in an effect, since this element will not be available at first render.
    streetOuterEl.current = document.querySelector('#street-section-outer')
  }, [])

  useEffect(() => {
    setInfoBubblePosition()
    updateBubbleDimensions()

    // Add or remove event listener based on whether infobubble was shown or hidden
    if (visible) {
      document.body.addEventListener('mousemove', handleBodyMouseMove)
    } else {
      document.body.removeEventListener('mousemove', handleBodyMouseMove)
    }

    // This appears to be needed to prevent a flicker during mouseover of the infobubble.
    // However because this affects props, it triggers a secondary render() in React and
    // incurs a small performance hit.
    // TODO: can we optimize this away without introducing the flicker?
    updatePolygon(infoBubble.considerMouseX, infoBubble.considerMouseY)
    // Trigger on position change even if the variable is not used in the effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, visible])

  function isInfoBubbleVisible (): boolean {
    return visible && !descriptionVisible
  }

  function handleHide (): void {
    infoBubble.hide()
    infoBubble.hideSegment(false)
  }

  function getTypeFromPosition (
    position: number | BuildingPosition | null
  ): number | null {
    if (position === BUILDING_LEFT_POSITION) {
      return INFO_BUBBLE_TYPE_LEFT_BUILDING
    } else if (position === BUILDING_RIGHT_POSITION) {
      return INFO_BUBBLE_TYPE_RIGHT_BUILDING
    } else if (Number.isFinite(position)) {
      return INFO_BUBBLE_TYPE_SEGMENT
    }

    return null
  }

  function hide (): void {
    infoBubble.hide()
  }

  // TODO: verify this continues to work with pointer / touch taps
  function handleMouseEnter (event: React.MouseEvent): void {
    dispatch(setInfoBubbleMouseInside(true))
    updatePolygon(event.pageX, event.pageY)
  }

  function handleMouseLeave (): void {
    dispatch(setInfoBubbleMouseInside(false))

    // Returns focus to body when pointer leaves the info bubble area
    // so that keyboard commands respond to pointer position rather than
    // any focused buttons/inputs
    loseAnyFocus()
  }

  function handleBodyMouseMove (event: React.MouseEvent): void {
    const mouseX = event.pageX
    const mouseY = event.pageY

    if (visible) {
      if (!infoBubble._withinHoverPolygon(mouseX, mouseY)) {
        infoBubble.show(false)
      }
    }

    debouncedUpdatePolygon(mouseX, mouseY)
  }

  function updatePolygon (mouseX: number, mouseY: number): void {
    const hoverPolygon = createHoverPolygon(mouseX, mouseY)
    dispatch(updateHoverPolygon(hoverPolygon))
  }

  const debouncedUpdatePolygon = debounce(
    updatePolygon,
    HOVER_POLYGON_DEBOUNCE
  )

  // TODO: make this a pure(r) function
  function createHoverPolygon (
    mouseX: number,
    mouseY: number
  ): Array<[number, number]> | null {
    // `hoverPolygon` is an array of points as [x, y] values. Values should
    // draw a shape counter-clockwise. The final value must match the first
    // value in order to create an enclosed polygon.
    let hoverPolygon: Array<[number, number]> = []

    if (!visible) {
      return hoverPolygon
    }

    // Bail if any reference to an element no longer exists
    if (el.current === null || segmentEl === undefined) return null

    const bubbleWidth = el.current.offsetWidth
    const bubbleHeight = el.current.offsetHeight
    const bubbleX = Number.parseInt(el.current.style.left)
    const bubbleY = Number.parseInt(el.current.style.top)

    if (mouseInside && !descriptionVisible) {
      const pos = getElAbsolutePos(segmentEl)

      // Left X position of segment element
      const segmentLeftX = pos[0] - (streetOuterEl.current?.scrollLeft ?? 0)
      // Right X position of segment element
      const segmentRightX = segmentLeftX + segmentEl.offsetWidth
      // Left X position of segment element with margin (edge of the hover polygon)
      const hitboxLeftX = segmentLeftX - INFO_BUBBLE_MARGIN_BUBBLE
      // Right X position of segment element with margin (edge of the hover polygon)
      const hitboxRightX = segmentRightX + INFO_BUBBLE_MARGIN_BUBBLE

      // Top Y position of segment element
      const segmentTopY = pos[1]
      // Bottom Y position of segment element
      const segmentBottomY = segmentTopY + segmentEl.offsetHeight
      // Bottom Y position of segment element with margin
      const hitboxBottomY = segmentBottomY + INFO_BUBBLE_MARGIN_BUBBLE

      hoverPolygon = [
        // Top left of infobubble
        [
          bubbleX - INFO_BUBBLE_MARGIN_BUBBLE,
          bubbleY - INFO_BUBBLE_MARGIN_BUBBLE
        ],
        // Bottom left of infobubble
        [
          bubbleX - INFO_BUBBLE_MARGIN_BUBBLE,
          bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
        ],
        // Diagonal line to hit edge of segment
        [hitboxLeftX, bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE + 120],
        // Bottom left of segment
        [hitboxLeftX, hitboxBottomY],
        // Bottom right of segment
        [hitboxRightX, hitboxBottomY],
        // Point at which to begin diagonal line to infobubble
        [
          hitboxRightX,
          bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE + 120
        ],
        // Bottom right of infobubble
        [
          bubbleX + bubbleWidth + INFO_BUBBLE_MARGIN_BUBBLE,
          bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
        ],
        // Top right of infobubble
        [
          bubbleX + bubbleWidth + INFO_BUBBLE_MARGIN_BUBBLE,
          bubbleY - INFO_BUBBLE_MARGIN_BUBBLE
        ],
        // Top left of infobubble (starting point)
        [
          bubbleX - INFO_BUBBLE_MARGIN_BUBBLE,
          bubbleY - INFO_BUBBLE_MARGIN_BUBBLE
        ]
      ]
    } else {
      let bottomY = mouseY - INFO_BUBBLE_MARGIN_MOUSE
      if (bottomY < bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE) {
        bottomY = bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
      }
      let bottomY2 = mouseY + INFO_BUBBLE_MARGIN_MOUSE
      if (bottomY2 < bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE) {
        bottomY2 = bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
      }

      if (descriptionVisible) {
        bottomY =
          bubbleY + bubbleHeight + DESCRIPTION_HOVER_POLYGON_MARGIN + 300
        bottomY2 = bottomY

        hoverPolygon = [
          [
            bubbleX - DESCRIPTION_HOVER_POLYGON_MARGIN,
            bubbleY - DESCRIPTION_HOVER_POLYGON_MARGIN
          ],
          [
            bubbleX - DESCRIPTION_HOVER_POLYGON_MARGIN,
            bubbleY + bubbleHeight + DESCRIPTION_HOVER_POLYGON_MARGIN + 300
          ],
          [
            bubbleX + bubbleWidth + DESCRIPTION_HOVER_POLYGON_MARGIN,
            bubbleY + bubbleHeight + DESCRIPTION_HOVER_POLYGON_MARGIN + 300
          ],
          [
            bubbleX + bubbleWidth + DESCRIPTION_HOVER_POLYGON_MARGIN,
            bubbleY - DESCRIPTION_HOVER_POLYGON_MARGIN
          ],
          [
            bubbleX - DESCRIPTION_HOVER_POLYGON_MARGIN,
            bubbleY - DESCRIPTION_HOVER_POLYGON_MARGIN
          ]
        ]
      } else {
        let diffX = 60 - (mouseY - bubbleY) / 5
        if (diffX < 0) {
          diffX = 0
        } else if (diffX > 50) {
          diffX = 50
        }

        hoverPolygon = [
          [
            bubbleX - INFO_BUBBLE_MARGIN_BUBBLE,
            bubbleY - INFO_BUBBLE_MARGIN_BUBBLE
          ],
          [
            bubbleX - INFO_BUBBLE_MARGIN_BUBBLE,
            bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
          ],
          [
            (bubbleX -
              INFO_BUBBLE_MARGIN_BUBBLE +
              mouseX -
              INFO_BUBBLE_MARGIN_MOUSE -
              diffX) /
              2,
            bottomY +
              (bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE - bottomY) *
                0.2
          ],
          [mouseX - INFO_BUBBLE_MARGIN_MOUSE - diffX, bottomY],
          [mouseX - INFO_BUBBLE_MARGIN_MOUSE, bottomY2],
          [mouseX + INFO_BUBBLE_MARGIN_MOUSE, bottomY2],
          [mouseX + INFO_BUBBLE_MARGIN_MOUSE + diffX, bottomY],
          [
            (bubbleX +
              bubbleWidth +
              INFO_BUBBLE_MARGIN_BUBBLE +
              mouseX +
              INFO_BUBBLE_MARGIN_MOUSE +
              diffX) /
              2,
            bottomY +
              (bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE - bottomY) *
                0.2
          ],
          [
            bubbleX + bubbleWidth + INFO_BUBBLE_MARGIN_BUBBLE,
            bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
          ],
          [
            bubbleX + bubbleWidth + INFO_BUBBLE_MARGIN_BUBBLE,
            bubbleY - INFO_BUBBLE_MARGIN_BUBBLE
          ],
          [
            bubbleX - INFO_BUBBLE_MARGIN_BUBBLE,
            bubbleY - INFO_BUBBLE_MARGIN_BUBBLE
          ]
        ]
      }
    }

    return hoverPolygon
  }

  /**
   * TODO: consolidate this with the dim calc in updateBubbleDimensions?
   */
  function setInfoBubblePosition (): void {
    if (segmentEl === undefined || !el.current || !visible) {
      return
    }

    // Determine dimensions and X/Y layout
    const bubbleWidth = el.current.offsetWidth
    const bubbleHeight = el.current.offsetHeight
    const pos = getElAbsolutePos(segmentEl)

    let bubbleX = pos[0] - (streetOuterEl.current?.scrollLeft ?? 0)
    let bubbleY = pos[1]

    // TODO const
    bubbleY -= bubbleHeight - 20
    if (bubbleY < MIN_TOP_MARGIN_FROM_VIEWPORT) {
      bubbleY = MIN_TOP_MARGIN_FROM_VIEWPORT
    }

    bubbleX += segmentEl.offsetWidth / 2
    bubbleX -= bubbleWidth / 2

    if (bubbleX < MIN_SIDE_MARGIN_FROM_VIEWPORT) {
      bubbleX = MIN_SIDE_MARGIN_FROM_VIEWPORT
    } else if (
      bubbleX >
      window.innerWidth - bubbleWidth - MIN_SIDE_MARGIN_FROM_VIEWPORT
    ) {
      bubbleX = window.innerWidth - bubbleWidth - MIN_SIDE_MARGIN_FROM_VIEWPORT
    }

    el.current.style.left = bubbleX + 'px'
    el.current.style.top = bubbleY + 'px'
  }

  function updateBubbleDimensions (): void {
    if (el.current === null) return

    let bubbleHeight

    const descriptionEl = el.current.querySelector('.description-canvas')

    if (descriptionVisible && descriptionEl) {
      const pos = getElAbsolutePos(descriptionEl)
      bubbleHeight = pos[1] + descriptionEl.offsetHeight - 38
    } else {
      bubbleHeight = el.current.offsetHeight
    }

    const height = bubbleHeight + 30

    el.current.style.webkitTransformOrigin = '50% ' + height + 'px'
    el.current.style.MozTransformOrigin = '50% ' + height + 'px'
    el.current.style.transformOrigin = '50% ' + height + 'px'
  }

  // Set class names
  const classNames = ['info-bubble']

  classNames.push(
    type === INFO_BUBBLE_TYPE_SEGMENT
      ? 'info-bubble-type-segment'
      : 'info-bubble-type-building'
  )
  if (visible) {
    classNames.push('visible')
  }
  if (descriptionVisible) {
    classNames.push('show-description')
  }

  return (
    <div
      className={classNames.join(' ')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // onTouchStart={handleTouchStart}
      ref={el}
    >
      <InfoBubbleHeader type={type} position={position} />
      <InfoBubbleControls type={type} position={position} />
      <InfoBubbleLower
        position={position}
        updateBubbleDimensions={updateBubbleDimensions}
        infoBubbleEl={el.current}
        updateHoverPolygon={updateHoverPolygon}
      />
    </div>
  )
}

export default InfoBubble
