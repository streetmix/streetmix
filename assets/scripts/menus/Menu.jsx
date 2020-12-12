import React, { useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import './Menu.scss'

Menu.propTypes = {
  className: PropTypes.string,
  isActive: PropTypes.bool,
  menuItemNode: PropTypes.instanceOf(Element),
  alignOpposite: PropTypes.bool,
  onShow: PropTypes.func,
  onHide: PropTypes.func,
  children: PropTypes.node
}

function Menu ({
  className = '',
  isActive = false,
  menuItemNode,
  alignOpposite,
  onShow = () => {},
  onHide = () => {},
  children
}) {
  const ref = useRef(null)
  const contentDirection = useSelector((state) => state.app.contentDirection)
  const handleResize = useCallback(() => {
    updateMenuPosition(
      ref.current,
      menuItemNode,
      contentDirection,
      alignOpposite
    )
  }, [menuItemNode, contentDirection, alignOpposite])

  useEffect(() => {
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  })

  /**
   * When the menu is shown or hidden, update its visual position and/or
   * run optional callback functions.
   */
  useLayoutEffect(() => {
    if (isActive) {
      // Only update the menu position before showing it
      // When hiding, the menu position stays where it is
      updateMenuPosition(
        ref.current,
        menuItemNode,
        contentDirection,
        alignOpposite
      )

      // Optional callback
      onShow()
    } else if (!isActive) {
      // Optional callback
      onHide()
    }
  }, [isActive, menuItemNode, contentDirection, alignOpposite, onShow, onHide])

  const classNames = ['menu']
  if (className) {
    classNames.push(className)
  }

  return (
    <CSSTransition
      appear={true}
      in={isActive}
      timeout={100}
      classNames="menu-visible"
      mountOnEnter={true}
      unmountOnExit={true}
    >
      <div className={classNames.join(' ')} ref={ref}>
        {children}
      </div>
    </CSSTransition>
  )
}

/**
 * Determines actual position of the menu, based on the menu item position prop
 * passed in by <MenuBar />
 *
 * @param {Node} el - menu container element
 * @param {Node} menuItemNode - menu content element
 * @param {String} contentDirection - either `ltr` or `rtl`
 * @param {Boolean} alignOpposite - whether element is right-aligned
 * @returns {Object} an object with {left, top} values used for absolute positioning
 */
function getMenuPosition (
  el,
  menuItemNode,
  contentDirection = 'ltr',
  alignOpposite = false
) {
  if (!el || !menuItemNode) return

  // Calculate left position
  let left

  // `rtl` content alignment
  if (contentDirection === 'rtl') {
    // If the menu width exceeds the left-most edge, or the `alignOpposite`
    // prop is true, the menu is aligned to the left-most edge
    const right = menuItemNode.offsetLeft + menuItemNode.offsetWidth
    if (right - el.offsetWidth < 0 || alignOpposite === true) {
      left = 0
    } else {
      // Otherwise, align menu with the right edge of the menu item
      left = right - el.offsetWidth
    }
  } else {
    // `ltr` content alignment (default)
    // Get maximum (right-most) edge of menu bar
    const maxXPos = el.parentNode.offsetWidth

    // If the menu width exceeds the right-most edge, or the `alignOpposite`
    // prop is true, the menu is aligned to the right-most edge
    if (
      menuItemNode.offsetLeft + el.offsetWidth > maxXPos ||
      alignOpposite === true
    ) {
      left = maxXPos - el.offsetWidth
    } else {
      // Otherwise, align menu with the left edge of the menu item
      left = menuItemNode.offsetLeft
    }
  }

  // Get top position
  // Top of menu aligns with bottom of menu item
  const top = menuItemNode.offsetTop + menuItemNode.offsetHeight

  return {
    left,
    top
  }
}

/**
 * Updates menu position
 *
 * @param {Node} el - menu element
 * @param {Node} menuItemNode - menu content element
 * @param {String} contentDirection - either `ltr` or `rtl`
 * @param {Boolean} alignOpposite - whether element is right-aligned
 * @returns {Object} an object with {left, top} values used for absolute positioning
 */
function updateMenuPosition (el, menuItemNode, contentDirection, alignOpposite) {
  const pos = getMenuPosition(el, menuItemNode, contentDirection, alignOpposite)

  // Set element position and make it visible
  if (el && pos) {
    el.style.left = pos.left + 'px'
    el.style.top = pos.top + 'px'
  }
}

export default React.memo(Menu)
