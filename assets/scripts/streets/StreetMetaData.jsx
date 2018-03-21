import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'
import StreetMetaWidth from './StreetMetaWidth'
import StreetMetaAuthor from './StreetMetaAuthor'
import StreetMetaDate from './StreetMetaDate'
import StreetMetaGeotag from './StreetMetaGeotag'

class StreetMetaData extends React.Component {
  static propTypes = {
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
          <StreetMetaWidth />
          <StreetMetaAuthor />
          <StreetMetaDate />
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
