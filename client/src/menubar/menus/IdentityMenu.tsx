import { useCallback } from 'react'
import { FormattedMessage } from 'react-intl'

import streetmixPlusIcon from 'url:~/src/ui/icons/streetmix-plus.svg'
import { onSignOutClick } from '~/src/users/authentication'
import Avatar from '~/src/users/Avatar'
import { useSelector, useDispatch } from '~/src/store/hooks'
import { openGallery } from '~/src/store/actions/gallery'
import { showDialog } from '~/src/store/slices/dialogs'
import Icon from '~/src/ui/Icon'
import USER_ROLES from '../../../../app/data/user_roles.json'
import Menu, { type MenuProps } from './Menu'
import MenuItem from './MenuItem'
import { MenuSeparator } from './MenuSeparator'
import './IdentityMenu.css'

export function IdentityMenu(props: MenuProps) {
  const user = useSelector((state) => state.user.signInData?.details)
  const isSubscriber = useSelector(
    (state) => state.user.signedIn && state.user.isSubscriber
  )
  const offline = useSelector((state) => state.system.offline)
  const dispatch = useDispatch()
  const handleClickMyStreets = useCallback(
    (_event: React.MouseEvent) => {
      const myStreetsLink = user?.id !== undefined ? `/${user.id}` : ''
      window.history.pushState({}, '', myStreetsLink)
      dispatch(openGallery({ userId: user.id }))
    },
    [user?.id, dispatch]
  )

  const isAdmin: boolean =
    user?.roles?.includes(USER_ROLES.ADMIN.value) ?? false

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
          <MenuItem onClick={handleClickMyStreets}>
            <Icon name="star" className="menu-item-icon" />
            <FormattedMessage
              id="menu.item.my-streets"
              defaultMessage="My streets"
            />
          </MenuItem>
        </>
      )}
      <MenuItem onClick={() => dispatch(showDialog('SETTINGS'))}>
        <Icon name="settings" className="menu-item-icon" />
        <FormattedMessage id="menu.item.settings" defaultMessage="Settings" />
      </MenuItem>
      <MenuSeparator />
      <MenuItem className="menu-item menu-sign-out" onClick={onSignOutClick}>
        <Icon name="sign-out" className="menu-item-icon" />
        <FormattedMessage id="menu.item.sign-out" defaultMessage="Sign out" />
      </MenuItem>
    </Menu>
  )
}
