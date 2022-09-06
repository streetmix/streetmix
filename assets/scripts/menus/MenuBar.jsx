import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
// import { useSelector, useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { IoLanguage } from 'react-icons/io5'
import { doSignIn } from '../users/authentication'
// import { showDialog } from '../store/slices/dialogs'
import logo from '../../images/logo_horizontal.svg'
import EnvironmentBadge from './EnvironmentBadge'
import MenuBarItem from './MenuBarItem'
import SignInButton from './SignInButton'
import UpgradeButton from './UpgradeButton'
import AvatarMenu from './AvatarMenu'
import './MenuBar.scss'

MenuBar.propTypes = {
  onMenuDropdownClick: PropTypes.func.isRequired
}

function MenuBar (props) {
  const user = useSelector((state) => state.user.signInData?.details || null)
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
  // const dispatch = useDispatch()
  const menuBarRightEl = useRef(null)

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
  function handleClickMenuButton (menu) {
    return (event) => {
      const el = event.target.closest('button')
      props.onMenuDropdownClick(menu, el)
    }
  }

  function handleClickUpgrade (event) {
    // dispatch(showDialog('UPGRADE'))
    window.open(
      'https://docs.streetmix.net/user-guide/streetmix-plus',
      '_blank'
    )
  }

  function handleWindowResize () {
    // Throw this event so that the StreetName can figure out if it needs
    // to push itself lower than the menubar
    window.dispatchEvent(
      new CustomEvent('stmx:menu_bar_resized', {
        detail: {
          rightMenuBarLeftPos:
            menuBarRightEl.current.getBoundingClientRect().left
        }
      })
    )
  }

  function renderUserAvatar (user) {
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
      <ul className="menu-bar-left">
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
            {isSubscriber && (
              // just wanted something back on the menu when subscribed
              <MenuBarItem
                label="Store"
                translation="menu.item.store"
                url="https://cottonbureau.com/people/streetmix"
              />
            )}
            {/* <MenuBarItem
              label="Donate"
              translation="menu.contribute.donate"
              url="https://opencollective.com/streetmix/"
            />
            <MenuBarItem
              label="Store"
              translation="menu.item.store"
              url="https://cottonbureau.com/people/streetmix"
            /> */}
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
          <MenuBarItem onClick={handleClickMenuButton('settings')}>
            <IoLanguage />
          </MenuBarItem>
        )}
        {!offline && renderUserAvatar(user, isSubscriber)}
      </ul>
      <EnvironmentBadge />
    </nav>
  )
}

export default MenuBar
