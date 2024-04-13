import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl'

const MINUTES_AGO = 1000 * 60 * 10
const SECONDS_AGO = 1000 * 60

/**
 * Compares two date objects to see if they are the same day
 *
 * @param {Date} a - first date to compare
 * @param {Date} b - second date to compare
 */
function isSameDay (a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function DateTimeRelative (props) {
  const now = new Date()
  const date = new Date(props.value)
  const diff = now - date

  if (diff >= 0) {
    if (diff < SECONDS_AGO) {
      return (
        <time dateTime={props.value} title={props.value}>
          <FormattedMessage
            id="datetime.seconds-ago"
            defaultMessage="A few seconds ago"
          />
        </time>
      )
    }

    if (diff < MINUTES_AGO) {
      return (
        <time dateTime={props.value} title={props.value}>
          <FormattedMessage
            id="datetime.minutes-ago"
            defaultMessage="A few minutes ago"
          />
        </time>
      )
    }
  }

  if (isSameDay(date, now)) {
    return (
      <FormattedMessage
        id="datetime.today"
        defaultMessage="Today at {time}"
        values={{
          time: (
            <time dateTime={props.value} title={props.value}>
              <FormattedTime
                timeZone={props.timezone}
                value={props.value}
                hour="numeric"
                minute="numeric"
              />
            </time>
          )
        }}
      />
    )
  }

  const yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24)

  if (isSameDay(date, yesterday)) {
    return (
      <FormattedMessage
        id="datetime.yesterday"
        defaultMessage="Yesterday at {time}"
        values={{
          time: (
            <time dateTime={props.value} title={props.value}>
              <FormattedTime
                timeZone={props.timezone}
                value={props.value}
                hour="numeric"
                minute="numeric"
              />
            </time>
          )
        }}
      />
    )
  }

  // Same year
  if (now.getFullYear() === date.getFullYear()) {
    return (
      <time dateTime={props.value} title={props.value}>
        <FormattedDate value={props.value} month="long" day="numeric" />
      </time>
    )
  }

  return (
    <time dateTime={props.value} title={props.value}>
      <FormattedDate
        value={props.value}
        year="numeric"
        month="long"
        day="numeric"
      />
    </time>
  )
}

DateTimeRelative.propTypes = {
  // prop should match an ISO date string, e.g. "2018-04-24T23:37:55.21Z"
  value: (props, propName, componentName) => {
    if (
      !/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+Z$/.test(
        props[propName]
      ) &&
      typeof props[propName] !== 'undefined'
    ) {
      return new Error(
        'Invalid prop `' +
          propName +
          '` supplied to' +
          ' `' +
          componentName +
          '`. It should be an ISO date string.' +
          ' Validation failed. Value: `' +
          props[propName] +
          '`'
      )
    }
  },
  timezone: PropTypes.string
}
