import React from 'react'
import { useIntl } from 'react-intl'

import streetmixPlusIcon from 'url:../ui/icons/streetmix-plus.svg'
import { Avatar } from '../users/Avatar.js'

import type { UserProfile } from '../types'
import './AvatarMenu.css'

interface AvatarMenuProps {
  user: UserProfile
  isSubscriber: boolean
  onClick: React.MouseEventHandler
}

function AvatarMenu({ user, isSubscriber = false, onClick }: AvatarMenuProps) {
  const { formatMessage } = useIntl()

  const subscriberLabel = isSubscriber
    ? formatMessage({
        id: 'users.roles.subscriber',
        defaultMessage: 'Streetmix+ member',
      })
    : ''

  return (
    <button
      className="menu-trigger menu-avatar"
      role="menuitem"
      onClick={onClick}
      id="menubar-identity"
    >
      <Avatar userId={user.id} />
      {isSubscriber && (
        <img
          className="menu-avatar-badge menu-avatar-subscriber"
          src={streetmixPlusIcon}
          alt={subscriberLabel}
          title={subscriberLabel}
        />
      )}
    </button>
  )
}

export default AvatarMenu
