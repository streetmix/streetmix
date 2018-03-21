import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { formatDate } from '../util/date_format'
import StreetWidth from './StreetWidth'
import StreetMetaAuthor from './StreetMetaAuthor'
import StreetMetaGeotag from './StreetMetaGeotag'

class StreetMetaData extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    street: PropTypes.any,
    locale: PropTypes.object
  }

  render () {
    return (
      <IntlProvider
        locale={this.props.locale.locale}
        key={this.props.locale.locale}
        messages={this.props.locale.messages}
      >
        <div className="street-metadata">
          <StreetWidth readOnly={this.props.readOnly} />
          <StreetMetaAuthor />
          <span className="street-metadata-date">{formatDate(this.props.street.updatedAt)}</span>
          <StreetMetaGeotag />
        </div>
      </IntlProvider>
    )
  }
}

function mapStateToProps (state) {
  return {
    locale: state.locale
  }
}

export default connect(mapStateToProps)(StreetMetaData)
