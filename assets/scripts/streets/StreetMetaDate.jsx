import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import DateTimeRelative from '../app/DateTimeRelative'

export class StreetMetaDate extends React.Component {
  static propTypes = {
    updatedAt: PropTypes.string
  }

  render () {
    if (!this.props.updatedAt) return null

    return (
      <span className="street-metadata-date">
        <DateTimeRelative value={this.props.updatedAt} />
      </span>
    )
  }
}

function mapStateToProps (state) {
  return {
    updatedAt: state.street.updatedAt
  }
}

export default connect(mapStateToProps)(StreetMetaDate)
