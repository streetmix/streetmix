import React from 'react'
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl'
import { isThisYear, isToday, isYesterday } from 'date-fns'

const MINUTES_AGO = 1000 * 60 * 10
const SECONDS_AGO = 1000 * 60

interface DateTimeRelativeProps {
  value: string // Should be ISO date string, e.g. "2018-04-24T23:37:55.21Z"
  timezone?: string
}

export default function DateTimeRelative ({
  value,
  timezone
}: DateTimeRelativeProps): React.ReactElement {
  const now = new Date()
  const date = new Date(value)
  const diff = now.getTime() - date.getTime()

  if (diff >= 0) {
    if (diff < SECONDS_AGO) {
      return (
        <time dateTime={value} title={value}>
          <FormattedMessage
            id="datetime.seconds-ago"
            defaultMessage="A few seconds ago"
          />
        </time>
      )
    }

    if (diff < MINUTES_AGO) {
      return (
        <time dateTime={value} title={value}>
          <FormattedMessage
            id="datetime.minutes-ago"
            defaultMessage="A few minutes ago"
          />
        </time>
      )
    }
  }

  if (isToday(date)) {
    return (
      <FormattedMessage
        id="datetime.today"
        defaultMessage="Today at {time}"
        values={{
          time: (
            <time dateTime={value} title={value}>
              <FormattedTime
                timeZone={timezone}
                value={value}
                hour="numeric"
                minute="numeric"
              />
            </time>
          )
        }}
      />
    )
  }

  if (isYesterday(date)) {
    return (
      <FormattedMessage
        id="datetime.yesterday"
        defaultMessage="Yesterday at {time}"
        values={{
          time: (
            <time dateTime={value} title={value}>
              <FormattedTime
                timeZone={timezone}
                value={value}
                hour="numeric"
                minute="numeric"
              />
            </time>
          )
        }}
      />
    )
  }

  if (isThisYear(date)) {
    return (
      <time dateTime={value} title={value}>
        <FormattedDate value={value} month="long" day="numeric" />
      </time>
    )
  }

  return (
    <time dateTime={value} title={value}>
      <FormattedDate value={value} year="numeric" month="long" day="numeric" />
    </time>
  )
}
