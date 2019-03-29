import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Avatar from '../users/Avatar'
import USER_ROLES from '../../../app/data/user_roles'
import { ICON_CROWN } from '../ui/icons'
import './AvatarMenu.scss'

function AvatarMenu (props) {
  const { user, onClick } = props
  const { id, roles } = user
  const isAdmin = roles && roles.includes(USER_ROLES.ADMIN)

  return (
    <button
      className="menu-attached menu-avatar"
      onClick={onClick}
    >
      <Avatar userId={id} />
      {isAdmin && <FontAwesomeIcon icon={ICON_CROWN} className="menu-avatar-admin" />}
      <span className="user-id">{id}</span>
    </button>
  )
}

AvatarMenu.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onClick: PropTypes.func
}

AvatarMenu.defaultProps = {
  onClick: () => {}
}

export default AvatarMenu
