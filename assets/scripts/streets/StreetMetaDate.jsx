import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedRelative } from 'react-intl'
import moment from 'moment'
import { formatDate } from '../util/date_format'

export class StreetMetaDate extends React.Component {
  static propTypes = {
    street: PropTypes.any
  }

  renderDateTime = () => {
    const ONE_DAY_AGO = 1000 * 60 * 60 * 24
    const updatedAt = this.props.street.updatedAt

    const now = moment()
    const date = moment(updatedAt)
    const diff = now - date

    if (diff < ONE_DAY_AGO && updatedAt) {
      return <FormattedRelative value={updatedAt} />
    } else {
      return formatDate(updatedAt)
    }
  }

  render () {
    return (
      <span className="street-metadata-date">
        {this.renderDateTime()}
      </span>
    )
  }
}

function mapStateToProps (state) {
  return {
    street: state.street
  }
}

export default connect(mapStateToProps)(StreetMetaDate)
