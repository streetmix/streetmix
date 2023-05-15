import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { StarIcon, MixerHorizontalIcon, ExitIcon } from '@radix-ui/react-icons'
import USER_ROLES from '../../../app/data/user_roles'
import { onSignOutClick } from '../users/authentication'
import Avatar from '../users/Avatar'
import { openGallery } from '../store/actions/gallery'
import { showDialog } from '../store/slices/dialogs'
import streetmixPlusIcon from '../ui/icons/streetmix-plus.svg'
import Menu from './Menu'
import './IdentityMenu.scss'

function IdentityMenu (props) {
  const user = useSelector((state) => state.user.signInData?.details || {})
  const isSubscriber = useSelector(
    (state) => state.user.signedIn && state.user.isSubscriber
  )
  const offline = useSelector((state) => state.system.offline)
  const dispatch = useDispatch()
  const handleClickMyStreets = useCallback(
    (event) => {
      event.preventDefault()
      dispatch(openGallery({ userId: user.id }))
    },
    [user.id, dispatch]
  )

  const isAdmin = user?.roles?.includes(USER_ROLES.ADMIN.value)
  const myStreetsLink = user.id ? `/${user.id}` : ''

  return (
    <Menu {...props} className="identity-menu">
      {!offline && (
        <>
          <div className="identity-section">
            <div className="identity-avatar-name">
              <div className="identity-avatar-name-left">
                <Avatar userId={user.id} />
              </div>
              <div className="identity-avatar-name-right">
                <div className="identity-avatar-display-name">
                  {user.displayName || user.id}
                </div>
                {user.displayName && (
                  <div className="menu-item-subtext">{user.id}</div>
                )}
              </div>
            </div>
            <div className="identity-roles">
              <ul>
                {isSubscriber && (
                  <li className="role-badge-subscriber">
                    <img
                      className="subscriber-icon"
                      src={streetmixPlusIcon}
                      alt=""
                    />
                    Streetmix+&lrm;
                  </li>
                )}
                {isAdmin && <li className="role-badge-admin">Admin</li>}
                {/* <li className="role-badge-generic">
                  Beta tester
                </li>
                <li className="role-badge-generic">
                  Translator
                </li> */}
              </ul>
            </div>
          </div>
          <a href={myStreetsLink} onClick={handleClickMyStreets}>
            <StarIcon className="menu-item-icon-radix" />
            <FormattedMessage
              id="menu.item.my-streets"
              defaultMessage="My streets"
            />
          </a>
        </>
      )}
      <a onClick={() => dispatch(showDialog('SETTINGS'))}>
        <MixerHorizontalIcon className="menu-item-icon-radix" />
        <FormattedMessage id="menu.item.settings" defaultMessage="Settings" />
      </a>
      <a className="menu-item" onClick={onSignOutClick}>
        <ExitIcon className="menu-item-icon-radix" />
        <FormattedMessage id="menu.item.sign-out" defaultMessage="Sign out" />
      </a>
    </Menu>
  )
}

export default IdentityMenu
