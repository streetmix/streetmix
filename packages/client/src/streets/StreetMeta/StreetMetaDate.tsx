import React from 'react'
import { IoTimeOutline } from 'react-icons/io5'
import { useSelector } from '../../store/hooks'
import DateTimeRelative from '../../app/DateTimeRelative'
import { isOwnedByCurrentUser } from '../owner'
import StreetMetaItem from './StreetMetaItem'

// Milliseconds that must have elapsed before recent edits display timestamp
const TIME_LIMIT = 6000

function StreetMetaDate (): React.ReactElement | null {
  const updatedAt = useSelector(
    (state) => state.street.updatedAt ?? state.street.clientUpdatedAt
  )

  if (updatedAt === undefined) return null

  // In the user has just edited the street, don't display the
  // "seconds ago" timestamp.
  if (isOwnedByCurrentUser()) {
    const now = new Date().getTime()
    const updated = new Date(updatedAt).getTime()
    if (now - updated < TIME_LIMIT) return null
  }

  return (
    <StreetMetaItem icon={<IoTimeOutline />}>
      {/* Wrap in <span> so phrases like "Today at 8:43 PM" preserve the space
          between text and <time> elements */}
      <span>
        <DateTimeRelative value={updatedAt} />
      </span>
    </StreetMetaItem>
  )
}

export default StreetMetaDate
