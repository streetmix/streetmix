import React from 'react'
import { FormattedMessage } from 'react-intl'
import { showDialog } from '../store/actions/dialogs'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

export class StreetMetaLink extends React.Component {
  static propTypes = {
    updatedAt: PropTypes.string,
    showAnalyticsDialog: PropTypes.func
  }

  render () {
    if (!this.props.updatedAt) return null

    return (
      <span className="street-metadata-author">
        <a href="#" onClick={this.props.showAnalyticsDialog}>
          <FormattedMessage id="btn-metalink" defaultMessage="Analytics" />
        </a>
      </span>
    )
  }
}

function mapStateToProps (state) {
  return {
    updatedAt: state.street.updatedAt,
    showAnalyticsDialog: PropTypes.func
  }
}

function mapDispatchToProps (dispatch) {
  return {
    showAnalyticsDialog: () => { dispatch(showDialog('ANALYTICS')) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StreetMetaLink)
