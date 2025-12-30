import { useEffect, useRef } from 'react'
import { useIntl } from 'react-intl'

import logo from 'url:../../images/logo_horizontal.svg'
import { useSelector } from '../store/hooks.js'
import AccessibleIcon from '../ui/AccessibleIcon.js'
import Icon from '../ui/Icon.js'
import { doSignIn } from '../users/authentication.js'
import InstanceBadge from './InstanceBadge.js'
import MenuBarItem from './MenuBarItem.js'
import SignInButton from './SignInButton.js'
import UpgradeButton from './UpgradeButton.js'
import AvatarMenu from './AvatarMenu.js'

import type { UserProfile } from '../types'
import './MenuBar.css'

export interface MenuCoords {
  leftMenuBarRightPos?: number
  rightMenuBarLeftPos?: number
}

interface MenuBarProps {
  onMenuDropdownClick: (menu: string, node: HTMLElement) => void
}

export function MenuBar({ onMenuDropdownClick }: MenuBarProps) {
  const user = useSelector((state) => state.user.signInData?.details)
  const isSubscriber = useSelector(
    (state) => state.user.signedIn && state.user.isSubscriber
  )
  const offline = useSelector((state) => state.system.offline)
  const enableLocaleSettings = useSelector(
    (state) =>
      state.flags.LOCALES_LEVEL_1.value ||
      state.flags.LOCALES_LEVEL_2.value ||
      state.flags.LOCALES_LEVEL_3.value
  )
  const menuBarRightEl = useRef<HTMLUListElement>(null)
  const menuBarLeftEl = useRef<HTMLUListElement>(null)
  const intl = useIntl()

  const languageLabel = intl.formatMessage({
    id: 'settings.language.label',
    defaultMessage: 'Language',
  })

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize)

    // StreetNameplateContainer needs to know the left position of the right
    // menu bar when it's mounted
    window.addEventListener('stmx:streetnameplate_mounted', handleWindowResize)

    // Clean up event listeners
    return () => {
      window.removeEventListener('resize', handleWindowResize)
      window.removeEventListener(
        'stmx:streetnameplate_mounted',
        handleWindowResize
      )
    }
  })

  /**
   * Handles clicks on <button> elements which result in a dropdown menu.
   * Pass in the name of this menu, and it returns (curries) a function
   * that handles the event.
   */
  function handleClick(menu: string): (event: React.MouseEvent) => void {
    return (event: React.MouseEvent) => {
      const el = (event.target as HTMLElement).closest('button')
      if (el !== null) {
        onMenuDropdownClick(menu, el)
      }
    }
  }

  function handleWindowResize(): void {
    // Throw this event so that the StreetName can figure out if it needs
    // to push itself lower than the menubar
    const rightMenuBarLeftPos =
      menuBarRightEl.current?.getBoundingClientRect().left
    const leftMenuBarRightPos =
      menuBarLeftEl.current?.getBoundingClientRect().right
    window.dispatchEvent(
      new CustomEvent<MenuCoords>('stmx:menu_bar_resized', {
        detail: {
          rightMenuBarLeftPos,
          leftMenuBarRightPos,
        },
      })
    )
  }

  function renderUserAvatar(user?: UserProfile) {
    return user ? (
      <li>
        <AvatarMenu
          user={user}
          isSubscriber={isSubscriber}
          onClick={handleClick('identity')}
        />
      </li>
    ) : (
      <li>
        <SignInButton onClick={doSignIn} />
      </li>
    )
  }

  return (
    <nav className="menu-bar" role="menubar" aria-orientation="horizontal">
      <ul className="menu-bar-left" ref={menuBarLeftEl}>
        <li className="menu-bar-title">
          <img src={logo} alt="Streemix" className="menu-bar-logo" />
          <h1>Streetmix</h1>
        </li>
        <MenuBarItem
          label="Help"
          translation="menu.item.help"
          id="menubar-help"
          onClick={handleClick('help')}
        />
        {!offline && (
          <>
            <MenuBarItem
              label="Contact"
              translation="menu.item.contact"
              id="menubar-contact"
              onClick={handleClick('contact')}
            />
            {!isSubscriber && <UpgradeButton />}
          </>
        )}
      </ul>
      <ul className="menu-bar-right" ref={menuBarRightEl}>
        <MenuBarItem
          label="New street"
          translation="menu.item.new-street"
          id="menubar-new"
          onClick={handleClick('new')}
        />
        <MenuBarItem
          label="Share"
          translation="menu.item.share"
          id="menubar-share"
          onClick={handleClick('share')}
        />
        {enableLocaleSettings && (
          <MenuBarItem
            id="menubar-locale"
            onClick={handleClick('locale')}
            tooltip={languageLabel}
          >
            <AccessibleIcon label={languageLabel}>
              <Icon name="language" size="18" />
            </AccessibleIcon>
          </MenuBarItem>
        )}
        {!offline && renderUserAvatar(user)}
      </ul>
      <InstanceBadge />
    </nav>
  )
}
