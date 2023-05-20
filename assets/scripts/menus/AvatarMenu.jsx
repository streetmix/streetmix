import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import Avatar from '../users/Avatar'
import streetmixPlusIcon from '../ui/icons/streetmix-plus.svg'
import './AvatarMenu.scss'

function AvatarMenu (props) {
  const { user, isSubscriber = false, onClick = () => {} } = props
  const { formatMessage } = useIntl()

  const subscriberLabel =
    isSubscriber &&
    formatMessage({
      id: 'users.roles.subscriber',
      defaultMessage: 'Streetmix+ member'
    })

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

AvatarMenu.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string)
  }),
  isSubscriber: PropTypes.bool,
  onClick: PropTypes.func
}

export default AvatarMenu
