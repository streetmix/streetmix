import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import USER_ROLES from '../../../app/data/user_roles'
import Avatar from '../users/Avatar'
import { ICON_BOLT } from '../ui/icons'
import streetmixPlusIcon from '../ui/icons/streetmix-plus.svg'
import './AvatarMenu.scss'

AvatarMenu.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string)
  }),
  isSubscriber: PropTypes.bool,
  onClick: PropTypes.func
}

function AvatarMenu (props) {
  const { user, isSubscriber = false, onClick = () => {} } = props
  const { id, roles = [] } = user
  const isAdmin = roles.includes(USER_ROLES.ADMIN.value)
  const { formatMessage } = useIntl()

  const adminLabel =
    isAdmin &&
    formatMessage({
      id: 'users.roles.admin',
      defaultMessage: 'Admin'
    })
  const subscriberLabel =
    isSubscriber &&
    formatMessage({
      id: 'users.roles.subscriber',
      defaultMessage: 'Streetmix+ member'
    })

  return (
    <button className="menu-attached menu-avatar" onClick={onClick}>
      <Avatar userId={id} />
      <span className="user-id">{id}</span>
      {isAdmin && (
        <FontAwesomeIcon
          icon={ICON_BOLT}
          className="menu-avatar-badge menu-avatar-admin"
          alt={adminLabel}
          title={adminLabel}
        />
      )}
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
