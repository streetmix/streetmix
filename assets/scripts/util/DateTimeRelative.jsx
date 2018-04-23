import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl'
import moment from 'moment'

const MINUTES_AGO = 1000 * 60 * 10
const SECONDS_AGO = 1000 * 60

export default class DateTimeRelative extends React.Component {
  static propTypes = {
    value: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.state = {
      now: moment(),
      date: moment(props.value)
    }
  }

  static deriveStateFromProps (nextProps, prevState) {
    return {
      date: moment(nextProps.value)
    }
  }

  render () {
    const diff = this.state.now - this.state.date

    if (diff >= 0) {
      if (diff < SECONDS_AGO) {
        return <FormattedMessage id="datetime.seconds-ago" defaultMessage="A few seconds ago" />
      }

      if (diff < MINUTES_AGO) {
        return <FormattedMessage id="datetime.minutes-ago" defaultMessage="A few minutes ago" />
      }
    }

    if (this.state.now.isSame(this.state.date, 'day')) {
      return (
        <FormattedMessage
          id="datetime.today"
          defaultMessage="Today at {time}"
          values={{
            time: <FormattedTime
              value={this.props.value}
              hour="numeric"
              minute="numeric"
            />
          }}
        />
      )
    }

    if (this.state.now.clone().subtract(1, 'day').isSame(this.state.date, 'day')) {
      return (
        <FormattedMessage
          id="datetime.yesterday"
          defaultMessage="Yesterday at {time}"
          values={{
            time: <FormattedTime
              value={this.props.value}
              hour="numeric"
              minute="numeric"
            />
          }}
        />
      )
    }

    if (this.state.now.isSame(this.state.date, 'year')) {
      return (
        <FormattedDate
          value={this.props.value}
          month="long"
          day="numeric"
        />
      )
    }

    return (
      <FormattedDate
        value={this.props.value}
        year="numeric"
        month="long"
        day="numeric"
      />
    )
  }
}
