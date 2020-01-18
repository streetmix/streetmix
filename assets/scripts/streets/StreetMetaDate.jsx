import React from 'react'
import { useSelector } from 'react-redux'
import DateTimeRelative from '../app/DateTimeRelative'

function StreetMetaDate (props) {
  const updatedAt = useSelector((state) => state.street.updatedAt)

  if (!updatedAt) return null

  return (
    <span className="street-metadata-date">
      <DateTimeRelative value={updatedAt} />
    </span>
  )
}

export default StreetMetaDate
