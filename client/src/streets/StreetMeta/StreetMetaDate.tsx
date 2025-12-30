import React from 'react'

import { useSelector } from '~/src/store/hooks'
import DateTimeRelative from '~/src/app/DateTimeRelative'
import Icon from '~/src/ui/Icon'
import { isOwnedByCurrentUser } from '../owner'
import StreetMetaItem from './StreetMetaItem'

// Milliseconds that must have elapsed before recent edits display timestamp
const TIME_LIMIT = 6000

export function StreetMetaDate() {
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
    <StreetMetaItem icon={<Icon name="time" />}>
      {/* Wrap in <span> so phrases like "Today at 8:43 PM" preserve the space
          between text and <time> elements */}
      <span>
        <DateTimeRelative value={updatedAt} />
      </span>
    </StreetMetaItem>
  )
}
