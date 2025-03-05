import React from 'react'

import avatar from '~/images/avatar.svg'
import { useGetUserQuery } from '../store/services/api'
import './Avatar.css'

interface AvatarProps {
  userId?: string
}

function Avatar ({ userId = '' }: AvatarProps): React.ReactElement {
  const { data } = useGetUserQuery(userId)
  const mimeType = (data?.profileImageUrl ?? '').endsWith('.jpg')
    ? 'image/jpeg'
    : 'image/png' // naively assume PNG for unknown extensions

  // If image URL does not load, a fallback image will be displayed
  return (
    <span className="avatar">
      <object type={mimeType} data={data?.profileImageUrl} aria-label={userId}>
        <img src={avatar} alt={userId} />
      </object>
    </span>
  )
}

export default Avatar
