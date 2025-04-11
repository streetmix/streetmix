import React, { useState, useEffect } from 'react'

import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { showMenu, clearMenus } from '../store/slices/menus'
import { useSelector, useDispatch } from '../store/hooks'
import {
  ContactMenu,
  HelpMenu,
  IdentityMenu,
  LocaleMenu,
  ShareMenu
} from './menus'
import MenuBar from './MenuBar'
import './MenusContainer.css'

function MenusContainer (): React.ReactElement {
  const activeMenu = useSelector((state): string | null => state.menus)
  const [activeMenuItemNode, setActiveMenuItemNode] = useState<
  HTMLElement | undefined
  >(undefined)
  const dispatch = useDispatch()

  useEffect(() => {
    // Hide menus if page loses visibility.
    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
      false
    )

    // Hide menus if a click occurs outside of a menu or menu button
    document.addEventListener('pointerdown', onBodyMouseDown)

    // Set up keypress listener to hide menus if visible
    registerKeypress('esc', hideAllMenus)

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
        false
      )
      document.removeEventListener('pointerdown', onBodyMouseDown)
      deregisterKeypress('esc', hideAllMenus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Force document.body to become the active element when there is no longer
  // an open menu.
  useEffect(() => {
    if (activeMenu === null) {
      document.body.focus()
    }
  }, [activeMenu])

  /**
   * Callback function passed to the MenuBar component.
   * Clicked buttons that have a menu component will report back to this component
   * what was clicked and a reference to that element, which is then passed to
   * individual menus.
   */
  function handleMenuDropdownClick (menu: string, node: HTMLElement): void {
    // If the clicked menu is already active, it's toggled off.
    if (activeMenu === menu) {
      setActiveMenuItemNode(undefined)
      dispatch(showMenu(null))
    } else {
      setActiveMenuItemNode(node)
      dispatch(showMenu(menu))
    }
  }

  /**
   * This event handler callback will close menus if a click occurs outside
   * of a menu or a menu button.
   * This remains in use despite the useOnClickOutside() hook, which
   * can't apply in this situation because we need to listen on two elements.
   */
  function onBodyMouseDown (event: Event): void {
    if (
      (event.target as HTMLElement).closest('.menu, .menu-attached') === null
    ) {
      hideAllMenus()
    }
  }

  function handleVisibilityChange (): void {
    if (document.hidden) {
      hideAllMenus()
    }
  }

  function hideAllMenus (): void {
    dispatch(clearMenus())
    setActiveMenuItemNode(undefined)
  }

  return (
    <>
      <MenuBar onMenuDropdownClick={handleMenuDropdownClick} />
      {/* Menus exist on a different z-index layer from the menu bar */}
      <div className="menus-container">
        <HelpMenu
          isActive={activeMenu === 'help'}
          menuItemNode={activeMenuItemNode}
          aria-labelledby="menubar-help"
        />
        <ContactMenu
          isActive={activeMenu === 'contact'}
          menuItemNode={activeMenuItemNode}
          aria-labelledby="menubar-contact"
        />
        <LocaleMenu
          isActive={activeMenu === 'locale'}
          menuItemNode={activeMenuItemNode}
          aria-labelledby="menubar-locale"
        />
        <ShareMenu
          isActive={activeMenu === 'share'}
          menuItemNode={activeMenuItemNode}
          aria-labelledby="menubar-share"
        />
        <IdentityMenu
          isActive={activeMenu === 'identity'}
          menuItemNode={activeMenuItemNode}
          alignOpposite={true}
          aria-labelledby="menubar-identity"
        />
      </div>
    </>
  )
}

export default MenusContainer
