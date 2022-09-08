import React from 'react'
import { useSelector } from 'react-redux'
import { IoTimeOutline } from 'react-icons/io5'
import DateTimeRelative from '../app/DateTimeRelative'
import { isOwnedByCurrentUser } from './owner'

// Milliseconds that must have elapsed before recent edits display timestamp
const TIME_LIMIT = 6000

function StreetMetaDate (props) {
  const updatedAt = useSelector(
    (state) => state.street.updatedAt || state.street.clientUpdatedAt
  )

  if (!updatedAt) return null

  // In the user has just edited the street, don't display the "seconds ago" timestamp.
  if (new Date() - new Date(updatedAt) < TIME_LIMIT && isOwnedByCurrentUser()) {
    return null
  }

  return (
    <span className="street-metadata-date">
      <IoTimeOutline />
      <DateTimeRelative value={updatedAt} />
    </span>
  )
}

export default StreetMetaDate
