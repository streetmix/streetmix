import React from 'react'
import { useGetUserQuery } from '../store/services/api'
import './Avatar.scss'

interface AvatarProps {
  userId: string
}

function Avatar ({ userId }: AvatarProps): React.ReactElement {
  const { data } = useGetUserQuery(userId)

  // Loading and error states will declare an empty `src` property
  return (
    <span className="avatar">
      <img src={data?.profileImageUrl} alt={userId} />
    </span>
  )
}

export default Avatar
