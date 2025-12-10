/**
 * Adds scroll buttons to UI elements.
 */
import React, { useEffect, useRef, useLayoutEffect } from 'react'

import { registerKeypress, deregisterKeypress } from '../app/keypress.js'
import { animate } from '../util/helpers.js'
import { Button } from './Button.js'
import Icon from './Icon.js'
import './Scrollable.css'

interface ScrollableProps {
  className?: string
  onScroll?: React.UIEventHandler
  allowKeyboardScroll?: boolean
  children?: React.ReactNode
  ref?: React.ForwardedRef<HTMLDivElement>
}

const SCROLL_ANIMATE_DURATION = 300 // in ms

function Scrollable(props: ScrollableProps) {
  const {
    className,
    onScroll = () => undefined,
    allowKeyboardScroll = false,
    children,
    ref = null,
  } = props
  const scrollerEl = useRef<HTMLDivElement>(null)
  const leftButtonEl = useRef<HTMLButtonElement>(null)
  const rightButtonEl = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    window.addEventListener('resize', checkButtonVisibilityState)
    checkButtonVisibilityState()

    return () => {
      window.removeEventListener('resize', checkButtonVisibilityState)
    }
  })

  useEffect(() => {
    if (allowKeyboardScroll) {
      registerKeypress('left', handleLeft)
      registerKeypress('right', handleRight)
    }

    return () => {
      if (allowKeyboardScroll) {
        deregisterKeypress('left', handleLeft)
        deregisterKeypress('right', handleRight)
      }
    }
  })

  useLayoutEffect(() => {
    if (leftButtonEl.current) {
      leftButtonEl.current.style.left = '-15px'
    }
    if (rightButtonEl.current) {
      rightButtonEl.current.style.right = '-15px'
    }
  })

  function handleLeft(_event: React.MouseEvent | React.KeyboardEvent) {
    const el = scrollerEl.current

    if (el === null) return

    const position = el.scrollLeft - (el.offsetWidth - 150) // TODO: document magic number

    animate(el, { scrollLeft: position }, SCROLL_ANIMATE_DURATION)
  }

  function handleRight(_event: React.MouseEvent | React.KeyboardEvent) {
    const el = scrollerEl.current

    if (!el) return

    const position = el.scrollLeft + (el.offsetWidth - 150) // TODO: document magic number

    animate(el, { scrollLeft: position }, SCROLL_ANIMATE_DURATION)
  }

  function handleScrollContainer(event: React.UIEvent<HTMLDivElement>) {
    checkButtonVisibilityState()

    // If parent has provided its own onScroll handler function, call that now.
    onScroll(event)
  }

  function checkButtonVisibilityState() {
    const el = scrollerEl.current

    if (!el) return

    const dir = window.getComputedStyle(el).direction

    // Swap left and right buttons if direction is `rtl`
    const left = dir === 'rtl' ? rightButtonEl.current : leftButtonEl.current
    const right = dir === 'rtl' ? leftButtonEl.current : rightButtonEl.current

    // We set styles manually instead of setting `disabled` as before; it's
    // because a button in a disabled state doesn't seem to get onClick
    // handlers attached.
    if (left) {
      if (el.scrollLeft === 0) {
        left.style.opacity = '0'
        left.style.pointerEvents = 'none'
        left.setAttribute('hidden', 'true')
        left.setAttribute('tabindex', '-1')
      } else {
        left.style.opacity = '1'
        left.style.pointerEvents = 'auto'
        left.removeAttribute('hidden')
        left.setAttribute('tabindex', '0')
      }
    }

    // scrollLeft will be a negative value if direction is `rtl`,
    // and a positive value if direction is `ltr`.
    // Math.abs() is used to guarantee a positive value for the comparison.
    if (right) {
      if (Math.abs(el.scrollLeft) === el.scrollWidth - el.offsetWidth) {
        right.style.opacity = '0'
        right.style.pointerEvents = 'none'
        right.setAttribute('hidden', 'true')
        right.setAttribute('tabindex', '-1')
      } else {
        right.style.opacity = '1'
        right.style.pointerEvents = 'auto'
        right.removeAttribute('hidden')
        right.setAttribute('tabindex', '0')
      }
    }
  }

  const containerClassName =
    className !== undefined ? `${className}-scrollable-container` : ''

  return (
    <div className={containerClassName} ref={ref}>
      {/* Buttons frame the content to preserve tab order */}
      <Button
        className="scrollable scroll-left"
        onClick={handleLeft}
        ref={leftButtonEl}
      >
        <Icon name="chevron-left" />
      </Button>
      <div
        className={className}
        onScroll={handleScrollContainer}
        ref={scrollerEl}
        style={{
          // Prevent overscroll from doing forward/back
          // navigation on some browsers
          overscrollBehaviorX: 'contain',
        }}
      >
        {children}
      </div>
      <Button
        className="scrollable scroll-right"
        onClick={handleRight}
        ref={rightButtonEl}
      >
        <Icon name="chevron-right" />
      </Button>
    </div>
  )
}

export default Scrollable
