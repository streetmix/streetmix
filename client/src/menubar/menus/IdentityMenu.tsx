import React, { useCallback } from 'react'
import { FormattedMessage } from 'react-intl'

import { onSignOutClick } from '~/src/users/authentication'
import Avatar from '~/src/users/Avatar'
import { useSelector, useDispatch } from '~/src/store/hooks'
import { openGallery } from '~/src/store/actions/gallery'
import { showDialog } from '~/src/store/slices/dialogs'
import streetmixPlusIcon from '~/src/ui/icons/streetmix-plus.svg'
import Icon from '~/src/ui/Icon'
import USER_ROLES from '../../../../app/data/user_roles.json'
import Menu, { type MenuProps } from './Menu'
import MenuSeparator from './MenuSeparator'
import './IdentityMenu.scss'

function IdentityMenu (props: MenuProps): React.ReactElement {
  const user = useSelector((state) => state.user.signInData?.details)
  const isSubscriber = useSelector(
    (state) => state.user.signedIn && state.user.isSubscriber
  )
  const offline = useSelector((state) => state.system.offline)
  const dispatch = useDispatch()
  const handleClickMyStreets = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      void dispatch(openGallery({ userId: user.id }))
    },
    [user?.id, dispatch]
  )

  const isAdmin: boolean =
    user?.roles?.includes(USER_ROLES.ADMIN.value) ?? false
  const myStreetsLink = user?.id !== undefined ? `/${user.id}` : ''

  return (
    <Menu {...props} className="identity-menu">
      {!offline && (
        <>
          <div className="identity-section">
            <div className="identity-avatar-name">
              <div className="identity-avatar-name-left">
                <Avatar userId={user?.id} />
              </div>
              <div className="identity-avatar-name-right">
                <div className="identity-avatar-display-name">
                  {user?.displayName ?? user?.id}
                </div>
                {user?.displayName !== undefined && (
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
          <MenuSeparator />
          <a href={myStreetsLink} onClick={handleClickMyStreets}>
            <Icon name="star" />
            <FormattedMessage
              id="menu.item.my-streets"
              defaultMessage="My streets"
            />
          </a>
        </>
      )}
      <a onClick={() => dispatch(showDialog('SETTINGS'))}>
        <Icon name="settings" />
        <FormattedMessage id="menu.item.settings" defaultMessage="Settings" />
      </a>
      <MenuSeparator />
      <a className="menu-item menu-sign-out" onClick={onSignOutClick}>
        <Icon name="sign-out" />
        <FormattedMessage id="menu.item.sign-out" defaultMessage="Sign out" />
      </a>
    </Menu>
  )
}

export default IdentityMenu
