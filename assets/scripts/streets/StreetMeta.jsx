import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'
import StreetMetaWidth from './StreetMetaWidth'
import StreetMetaAuthor from './StreetMetaAuthor'
import StreetMetaDate from './StreetMetaDate'
import StreetMetaGeotag from './StreetMetaGeotag'

class StreetMeta extends React.Component {
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
          <StreetMetaGeotag />
          <StreetMetaAuthor />
          <StreetMetaDate />
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

export default connect(mapStateToProps)(StreetMeta)
