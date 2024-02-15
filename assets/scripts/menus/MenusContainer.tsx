import React, { useState, useEffect } from 'react'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { showMenu, clearMenus } from '../store/slices/menus'
import { useSelector, useDispatch } from '../store/hooks'
import MenuBar from './MenuBar'
import HelpMenu from './HelpMenu'
import ContactMenu from './ContactMenu'
import IdentityMenu from './IdentityMenu'
import LocaleMenu from './LocaleMenu'
import ShareMenu from './ShareMenu'
import './MenusContainer.scss'

function MenusContainer (): React.ReactElement {
  const activeMenu = useSelector((state): string | null => state.menus)
  const [activeMenuItemNode, setActiveMenuItemNode] =
    useState<HTMLElement | null>(null)
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
   *
   * @param {string} menu - name of the menu that was clicked
   * @param {HTMLElement} node - reference to the menu item button, used to position menu
   */
  function handleMenuDropdownClick (menu: string, node: HTMLElement): void {
    // If the clicked menu is already active, it's toggled off.
    if (activeMenu === menu) {
      setActiveMenuItemNode(null)
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
    setActiveMenuItemNode(null)
  }

  return (
    <>
      <MenuBar onMenuDropdownClick={handleMenuDropdownClick} />
      {/* Menus exist on a different z-index layer from the menu bar */}
      <div className="menus-container">
        <HelpMenu
          isActive={activeMenu === 'help'}
          menuItemNode={activeMenuItemNode}
        />
        <ContactMenu
          isActive={activeMenu === 'contact'}
          menuItemNode={activeMenuItemNode}
        />
        <LocaleMenu
          isActive={activeMenu === 'locale'}
          menuItemNode={activeMenuItemNode}
        />
        <ShareMenu
          isActive={activeMenu === 'share'}
          menuItemNode={activeMenuItemNode}
        />
        <IdentityMenu
          isActive={activeMenu === 'identity'}
          menuItemNode={activeMenuItemNode}
          alignOpposite={true}
        />
      </div>
    </>
  )
}

export default MenusContainer
