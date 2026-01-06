import avatar from 'url:~/images/avatar.svg'
import { useGetUserQuery } from '../store/services/api.js'
import './Avatar.css'

interface AvatarProps {
  userId?: string
}

export function Avatar({ userId = '' }: AvatarProps) {
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
