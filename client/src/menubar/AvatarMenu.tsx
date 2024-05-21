import React from 'react'
import { useIntl } from 'react-intl'
import Avatar from '../users/Avatar'
import streetmixPlusIcon from '../ui/icons/streetmix-plus.svg'
import type { UserProfile } from '../types'
import './AvatarMenu.scss'

interface AvatarMenuProps {
  user: UserProfile
  isSubscriber: boolean
  onClick: (event: React.MouseEvent) => void
}

function AvatarMenu ({
  user,
  isSubscriber = false,
  onClick
}: AvatarMenuProps): React.ReactElement {
  const { formatMessage } = useIntl()

  const subscriberLabel = isSubscriber
    ? formatMessage({
      id: 'users.roles.subscriber',
      defaultMessage: 'Streetmix+ member'
    })
    : ''

  return (
    <button className="menu-attached menu-avatar" onClick={onClick}>
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
