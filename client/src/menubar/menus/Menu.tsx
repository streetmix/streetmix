import React, {
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  memo,
} from 'react'
import { CSSTransition } from 'react-transition-group'

import { useSelector } from '../../store/hooks.js'
import './Menu.css'

export interface MenuProps {
  className?: string
  isActive?: boolean
  menuItemNode?: HTMLElement
  menuBarRef: React.RefObject<HTMLElement | null>
  alignOpposite?: boolean
  onShow?: () => void
  onHide?: () => void
  children?: React.ReactNode
}

interface MenuPosition {
  left: number
  top: number
}

function Menu({
  className = '',
  isActive = false,
  menuItemNode,
  menuBarRef,
  alignOpposite,
  onShow = () => undefined,
  onHide = () => undefined,
  children,
  ...props
}: MenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const contentDirection = useSelector((state) => state.app.contentDirection)
  const handleResize = useCallback(() => {
    updateMenuPosition(
      ref.current,
      menuItemNode,
      menuBarRef,
      contentDirection,
      alignOpposite
    )
  }, [menuBarRef, menuItemNode, contentDirection, alignOpposite])

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
        menuBarRef,
        contentDirection,
        alignOpposite
      )

      // Optional callback
      onShow()
    } else if (!isActive) {
      // Optional callback
      onHide()
    }
  }, [
    isActive,
    menuBarRef,
    menuItemNode,
    contentDirection,
    alignOpposite,
    onShow,
    onHide,
  ])

  const classNames = ['menu']
  if (className) {
    classNames.push(className)
  }

  return (
    <CSSTransition
      appear
      in={isActive}
      timeout={100}
      classNames="menu-visible"
      mountOnEnter
      unmountOnExit
      nodeRef={ref}
    >
      <div role="menu" className={classNames.join(' ')} ref={ref} {...props}>
        {children}
      </div>
    </CSSTransition>
  )
}

/**
 * Determines actual position of the menu, based on the menu item position prop
 * passed in by <MenuBar />, and returns an object with left and top values for
 * absolute positioning.
 */
function getMenuPosition(
  el: HTMLElement | null, // menu container element
  menuItemNode?: HTMLElement, // menu content element
  menuBarRef?: React.RefObject<HTMLElement | null>, // menu bar ref element
  contentDirection: 'ltr' | 'rtl' = 'ltr',
  alignOpposite = false // whether element is right-aligned
): MenuPosition | undefined {
  if (!el || !menuItemNode || !menuBarRef?.current) return

  // Calculate left position
  let left

  // `rtl` content alignment
  if (contentDirection === 'rtl') {
    // If the menu width exceeds the left-most edge, or the `alignOpposite`
    // prop is true, the menu is aligned to the left-most edge
    const right = menuItemNode.offsetLeft + menuItemNode.offsetWidth
    if (right - el.offsetWidth < 0 || alignOpposite) {
      left = 0
    } else {
      // Otherwise, align menu with the right edge of the menu item
      left = right - el.offsetWidth
    }
  } else {
    // `ltr` content alignment (default)
    // Get maximum (right-most) edge of menu bar
    const parent = menuBarRef.current
    console.log(parent.getBoundingClientRect())
    const maxXPos = parent?.offsetWidth

    // If the menu width exceeds the right-most edge, or the `alignOpposite`
    // prop is true, the menu is aligned to the right-most edge
    if (menuItemNode.offsetLeft + el.offsetWidth > maxXPos || alignOpposite) {
      left = maxXPos - el.offsetWidth
    } else {
      // Otherwise, align menu with the left edge of the menu item
      left = menuItemNode.offsetLeft
    }
  }

  // Get top position
  // Top of menu aligns with bottom of menu item
  const top = menuItemNode.offsetTop + menuItemNode.offsetHeight

  // We're no longer calculating `top` because it's just going to be the top of
  // the menus-container element. This won't handle if the menu wraps on mobile,
  // but that UI needs to be replaced anyway.
  return {
    left,
    top,
  }
}

function updateMenuPosition(
  el: HTMLElement | null, // menu container element
  menuItemNode?: HTMLElement, // menu content element
  menuBarRef?: React.RefObject<HTMLElement | null>, // menu bar ref element
  contentDirection: 'ltr' | 'rtl' = 'ltr',
  alignOpposite = false // whether element is right-aligned
): void {
  const pos = getMenuPosition(
    el,
    menuItemNode,
    menuBarRef,
    contentDirection,
    alignOpposite
  )

  // Set element position and make it visible
  if (el && pos !== undefined) {
    el.style.left = pos.left.toString() + 'px'
    el.style.top = pos.top.toString() + 'px'
  }
}

export default memo(Menu)
