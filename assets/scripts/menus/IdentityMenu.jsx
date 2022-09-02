import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { StarIcon, ExitIcon } from '@radix-ui/react-icons'
import { onSignOutClick } from '../users/authentication'
import { openGallery } from '../store/actions/gallery'
import Menu from './Menu'
import './IdentityMenu.scss'

function IdentityMenu (props) {
  const userId = useSelector((state) => state.user.signInData?.userId)
  const offline = useSelector((state) => state.system.offline)
  const dispatch = useDispatch()
  const handleClickMyStreets = useCallback(
    (event) => {
      event.preventDefault()
      dispatch(openGallery({ userId }))
    },
    [userId, dispatch]
  )

  const myStreetsLink = userId ? `/${userId}` : ''

  return (
    <Menu {...props} className="identity-menu">
      {!offline && (
        <a href={myStreetsLink} onClick={handleClickMyStreets}>
          <StarIcon className="menu-item-icon-radix" />
          <FormattedMessage
            id="menu.item.my-streets"
            defaultMessage="My streets"
          />
        </a>
      )}
      <a className="menu-item" onClick={onSignOutClick}>
        <ExitIcon className="menu-item-icon-radix" />
        <FormattedMessage id="menu.item.sign-out" defaultMessage="Sign out" />
      </a>
    </Menu>
  )
}

export default IdentityMenu
