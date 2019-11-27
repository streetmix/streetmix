/**
 * Adds scroll buttons to UI elements.
 */
import React, { useEffect, useRef, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { animate } from '../util/helpers'
import { ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT } from '../ui/icons'
import { registerKeypress, deregisterKeypress } from '../app/keypress'

const SCROLL_ANIMATE_DURATION = 300 // in ms

const Scrollable = React.forwardRef((props, ref) => {
  const {
    className,
    onScroll = () => {},
    allowKeyboardScroll = false,
    children
  } = props
  const scrollerEl = useRef()
  const leftButtonEl = useRef()
  const rightButtonEl = useRef()

  useEffect(() => {
    window.addEventListener('resize', checkButtonVisibilityState)
    checkButtonVisibilityState()

    return () => {
      window.removeEventListener('resize', checkButtonVisibilityState)
    }
  })

  useEffect(() => {
    if (allowKeyboardScroll === true) {
      registerKeypress('left', handleClickLeft)
      registerKeypress('right', handleClickRight)
    }

    return () => {
      if (allowKeyboardScroll === true) {
        deregisterKeypress('left', handleClickLeft)
        deregisterKeypress('right', handleClickRight)
      }
    }
  })

  useLayoutEffect(() => {
    leftButtonEl.current.style.left = '-15px'
    rightButtonEl.current.style.right = '-15px'
  })

  function handleClickLeft (event) {
    const el = scrollerEl.current
    const position = el.scrollLeft - (el.offsetWidth - 150) // TODO: document magic number

    animate(el, { scrollLeft: position }, SCROLL_ANIMATE_DURATION)
  }

  function handleClickRight (event) {
    const el = scrollerEl.current
    const position = el.scrollLeft + (el.offsetWidth - 150) // TODO: document magic number

    animate(el, { scrollLeft: position }, SCROLL_ANIMATE_DURATION)
  }

  function handleScrollContainer (event) {
    checkButtonVisibilityState()

    // If parent has provided its own onScroll handler function, call that now.
    onScroll(event)
  }

  function checkButtonVisibilityState () {
    const el = scrollerEl.current

    // We set styles manually instead of setting `disabled` as before; it's
    // because a button in a disabled state doesn't seem to get onClick
    // handlers attached.
    if (el.scrollLeft === 0) {
      leftButtonEl.current.style.opacity = 0
      leftButtonEl.current.style.pointerEvents = 'none'
    } else {
      leftButtonEl.current.style.opacity = 1
      leftButtonEl.current.style.pointerEvents = 'auto'
    }

    if (el.scrollLeft === el.scrollWidth - el.offsetWidth) {
      rightButtonEl.current.style.opacity = 0
      rightButtonEl.current.style.pointerEvents = 'none'
    } else {
      rightButtonEl.current.style.opacity = 1
      rightButtonEl.current.style.pointerEvents = 'auto'
    }
  }

  const containerClassName = className
    ? `${className}-scrollable-container`
    : ''

  return (
    <div className={containerClassName} ref={ref}>
      <div
        className={className}
        onScroll={handleScrollContainer}
        ref={scrollerEl}
      >
        {children}
      </div>
      <button
        className="scrollable scroll-left"
        onClick={handleClickLeft}
        ref={leftButtonEl}
      >
        <FontAwesomeIcon icon={ICON_CHEVRON_LEFT} />
      </button>
      <button
        className="scrollable scroll-right"
        onClick={handleClickRight}
        ref={rightButtonEl}
      >
        <FontAwesomeIcon icon={ICON_CHEVRON_RIGHT} />
      </button>
    </div>
  )
})

Scrollable.propTypes = {
  className: PropTypes.string,
  onScroll: PropTypes.func,
  allowKeyboardScroll: PropTypes.bool,
  children: PropTypes.node
}

export default Scrollable
