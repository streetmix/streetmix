import React from 'react'
import PropTypes from 'prop-types'
import { useGetUserQuery } from '../store/services/api'
import './Avatar.scss'

function Avatar ({ userId }) {
  const { data } = useGetUserQuery(userId)

  // Loading and error states will declare an empty `src` property
  return (
    <span className="avatar">
      <img src={data?.profileImageUrl || undefined} alt={userId} />
    </span>
  )
}

Avatar.propTypes = {
  userId: PropTypes.string.isRequired
}

export default Avatar
