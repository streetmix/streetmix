import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import { showGallery } from '../gallery/view'
import { onSignOutClick } from '../users/authentication'
import './IdentityMenu.scss'

function IdentityMenu (props) {
  const userId = useSelector(
    (state) => state.user.signInData && state.user.signInData.userId
  )
  const noInternet = useSelector((state) => state.system.noInternet)
  const myStreetsLink = userId ? `/${userId}` : ''
  const handleClickMyStreets = useCallback(
    (event) => {
      event.preventDefault()
      showGallery(userId)
    },
    [userId]
  )

  return (
    <Menu {...props} className="identity-menu">
      {!noInternet && (
        <a href={myStreetsLink} onClick={handleClickMyStreets}>
          <FormattedMessage
            id="menu.item.my-streets"
            defaultMessage="My streets"
          />
        </a>
      )}
      <a className="menu-item" onClick={onSignOutClick}>
        <FormattedMessage id="menu.item.sign-out" defaultMessage="Sign out" />
      </a>
    </Menu>
  )
}

export default IdentityMenu
