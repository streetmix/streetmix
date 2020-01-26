import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import { onSignOutClick } from '../users/authentication'
import { showGallery } from '../store/actions/gallery'
import './IdentityMenu.scss'

function IdentityMenu (props) {
  const userId = useSelector(
    (state) => state.user.signInData && state.user.signInData.userId
  )
  const noInternet = useSelector((state) => state.system.noInternet)
  const dispatch = useDispatch()
  const handleClickMyStreets = useCallback(
    (event) => {
      event.preventDefault()
      dispatch(showGallery(userId))
    },
    [userId, dispatch]
  )

  const myStreetsLink = userId ? `/${userId}` : ''

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
