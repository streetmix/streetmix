import React from 'react'
import PropTypes from 'prop-types'
import Avatar from '../users/Avatar'

function AvatarMenu (props) {
  return (
    <button
      className="menu-attached menu-avatar"
      onClick={props.onClick}
    >
      <Avatar userId={props.userId} />
      <span className="user-id">{props.userId}</span>
    </button>
  )
}

AvatarMenu.propTypes = {
  userId: PropTypes.string,
  onClick: PropTypes.func
}

AvatarMenu.defaultProps = {
  onClick: () => {}
}

export default AvatarMenu
