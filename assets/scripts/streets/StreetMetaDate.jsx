import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { formatDate } from '../util/date_format'

export class StreetMetaDate extends React.Component {
  static propTypes = {
    street: PropTypes.any
  }

  render () {
    return <span className="street-metadata-date">{formatDate(this.props.street.updatedAt)}</span>
  }
}

function mapStateToProps (state) {
  return {
    street: state.street
  }
}

export default connect(mapStateToProps)(StreetMetaDate)
