import React, { useEffect, useRef } from 'react'
import { useIntl } from 'react-intl'
import { IoLanguage } from 'react-icons/io5'

import { useSelector } from '../store/hooks'
import AccessibleIcon from '../ui/AccessibleIcon'
import { doSignIn } from '../users/authentication'
import logo from '../../images/logo_horizontal.svg'
import InstanceBadge from './InstanceBadge'
import MenuBarItem from './MenuBarItem'
import SignInButton from './SignInButton'
import UpgradeButton from './UpgradeButton'
import AvatarMenu from './AvatarMenu'

import type { UserProfile } from '../types'
import './MenuBar.scss'

interface MenuBarProps {
  onMenuDropdownClick: (menu: string, node: HTMLElement) => void
}

function MenuBar ({ onMenuDropdownClick }: MenuBarProps): React.ReactElement {
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
    defaultMessage: 'Language'
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
  function handleClickMenuButton (
    menu: string
  ): (event: React.MouseEvent) => void {
    return (event: React.MouseEvent) => {
      const el = (event.target as HTMLElement).closest('button')
      if (el !== null) {
        onMenuDropdownClick(menu, el)
      }
    }
  }

  function handleClickUpgrade (): void {
    // dispatch(showDialog('UPGRADE'))
    window.open(
      'https://docs.streetmix.net/user-guide/streetmix-plus',
      '_blank'
    )
  }

  function handleWindowResize (): void {
    // Throw this event so that the StreetName can figure out if it needs
    // to push itself lower than the menubar
    const rightMenuBarLeftPos =
      menuBarRightEl.current?.getBoundingClientRect().left
    const leftMenuBarRightPos =
      menuBarLeftEl.current?.getBoundingClientRect().right
    window.dispatchEvent(
      new CustomEvent('stmx:menu_bar_resized', {
        detail: {
          rightMenuBarLeftPos,
          leftMenuBarRightPos
        }
      })
    )
  }

  function renderUserAvatar (user?: UserProfile): React.ReactElement {
    return user
      ? (
        <li>
          <AvatarMenu
            user={user}
            isSubscriber={isSubscriber}
            onClick={handleClickMenuButton('identity')}
          />
        </li>
        )
      : (
        <li>
          <SignInButton onClick={doSignIn} />
        </li>
        )
  }

  return (
    <nav className="menu-bar">
      <ul className="menu-bar-left" ref={menuBarLeftEl}>
        <li className="menu-bar-title">
          <img src={logo} alt="Streemix" className="menu-bar-logo" />
          <h1>Streetmix</h1>
        </li>
        <MenuBarItem
          label="Help"
          translation="menu.item.help"
          onClick={handleClickMenuButton('help')}
        />
        {!offline && (
          <>
            <MenuBarItem
              label="Contact"
              translation="menu.item.contact"
              onClick={handleClickMenuButton('contact')}
            />
            {!isSubscriber && <UpgradeButton onClick={handleClickUpgrade} />}
          </>
        )}
      </ul>
      <ul className="menu-bar-right" ref={menuBarRightEl}>
        <MenuBarItem
          label="New street"
          translation="menu.item.new-street"
          url="/new"
          target="_blank"
        />
        <MenuBarItem
          label="Share"
          translation="menu.item.share"
          onClick={handleClickMenuButton('share')}
        />
        {enableLocaleSettings && (
          <MenuBarItem
            onClick={handleClickMenuButton('locale')}
            tooltip={languageLabel}
          >
            <AccessibleIcon label={languageLabel}>
              <IoLanguage />
            </AccessibleIcon>
          </MenuBarItem>
        )}
        {!offline && renderUserAvatar(user)}
      </ul>
      <InstanceBadge />
    </nav>
  )
}

export default MenuBar
