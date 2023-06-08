import React from 'react'
import PropTypes from 'prop-types'
import { useGetUserQuery } from '../store/services/api'
import './Avatar.scss'

function Avatar ({ userId }) {
  const { data, error, isLoading, isError } = useGetUserQuery(userId)

  // TODO: Handle loading state
  if (isLoading) {
    return null
  }

  // TODO: Handle error state
  if (isError) {
    console.error(error.toString())
    return null
  }

  return (
    <span className="avatar">
      <img src={data.profileImageUrl} alt={userId} />
    </span>
  )
}

Avatar.propTypes = {
  userId: PropTypes.string.isRequired
}

export default React.memo(Avatar)
