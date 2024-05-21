/**
 * Adds scroll buttons to UI elements.
 */
import React, { forwardRef, useEffect, useRef, useLayoutEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { animate } from '../util/helpers'
import { ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT } from './icons'
import Button from './Button'
import './Scrollable.scss'

interface ScrollableProps {
  className?: string
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void
  allowKeyboardScroll?: boolean
  children?: React.ReactNode
}

const SCROLL_ANIMATE_DURATION = 300 // in ms

const WrappedScrollable = forwardRef(function Scrollable (
  props: ScrollableProps,
  ref: React.Ref<HTMLDivElement>
): React.ReactElement {
  const {
    className,
    onScroll = () => undefined,
    allowKeyboardScroll = false,
    children
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
      registerKeypress('left', handleClickLeft)
      registerKeypress('right', handleClickRight)
    }

    return () => {
      if (allowKeyboardScroll) {
        deregisterKeypress('left', handleClickLeft)
        deregisterKeypress('right', handleClickRight)
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

  function handleClickLeft (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ): void {
    const el = scrollerEl.current

    if (el === null) return

    const position = el.scrollLeft - (el.offsetWidth - 150) // TODO: document magic number

    animate(el, { scrollLeft: position }, SCROLL_ANIMATE_DURATION)
  }

  function handleClickRight (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ): void {
    const el = scrollerEl.current

    if (!el) return

    const position = el.scrollLeft + (el.offsetWidth - 150) // TODO: document magic number

    animate(el, { scrollLeft: position }, SCROLL_ANIMATE_DURATION)
  }

  function handleScrollContainer (event: React.UIEvent<HTMLDivElement>): void {
    checkButtonVisibilityState()

    // If parent has provided its own onScroll handler function, call that now.
    onScroll(event)
  }

  function checkButtonVisibilityState (): void {
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
        onClick={handleClickLeft}
        ref={leftButtonEl}
      >
        <FontAwesomeIcon icon={ICON_CHEVRON_LEFT} />
      </Button>
      <div
        className={className}
        onScroll={handleScrollContainer}
        ref={scrollerEl}
        style={{
          // Prevent overscroll from doing forward/back
          // navigation on some browsers
          overscrollBehaviorX: 'contain'
        }}
      >
        {children}
      </div>
      <Button
        className="scrollable scroll-right"
        onClick={handleClickRight}
        ref={rightButtonEl}
      >
        <FontAwesomeIcon icon={ICON_CHEVRON_RIGHT} />
      </Button>
    </div>
  )
})

export default WrappedScrollable
