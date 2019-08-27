import React from 'react'
import { FormattedMessage } from 'react-intl'
import { showDialog } from '../store/actions/dialogs'
import { getStreetCapacity, formatCapacity } from '../util/street_analytics'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

export class StreetMetaAnalytics extends React.Component {
  static propTypes = {
    locale: PropTypes.string,
    updatedAt: PropTypes.string,
    street: PropTypes.shape({}),
    showAnalyticsDialog: PropTypes.func
  }

  render () {
    const { updatedAt, street, locale } = this.props
    if (!updatedAt) return null
    const data = getStreetCapacity(street, locale)
    // TODO handle 0 case
    return (
      <span className="street-metadata-author">
        <a href="#" onClick={this.props.showAnalyticsDialog}>
          <FormattedMessage
            id="capacity.ppl-per-hr"
            defaultMessage="{capacity} people/hr"
            values={{ capacity: formatCapacity(data.averageTotal) }} />
        </a>
      </span>
    )
  }
}

function mapStateToProps (state) {
  return {
    updatedAt: state.street.updatedAt,
    street: state.street,
    locale: state.locale.locale,
    showAnalyticsDialog: PropTypes.func
  }
}

function mapDispatchToProps (dispatch) {
  return {
    showAnalyticsDialog: () => { dispatch(showDialog('ANALYTICS')) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StreetMetaAnalytics)
