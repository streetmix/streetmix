import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { IntlProvider, FormattedMessage } from 'react-intl'
import { formatDate } from '../util/date_format'
import { t } from '../app/locale'
import { getRemixOnFirstEdit } from './remix'
import { showGallery } from '../gallery/view'
import StreetWidth from './StreetWidth'
import StreetMetaGeotag from './StreetMetaGeotag'
import Avatar from '../users/Avatar'

class StreetMetaData extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    signedIn: PropTypes.bool.isRequired,
    userId: PropTypes.string,
    street: PropTypes.any,
    locale: PropTypes.object
  }

  static defaultProps = {
    userId: ''
  }

  constructor (props) {
    super(props)

    this.state = {
      street: this.props.street
    }
  }

  onClickAuthor = (event) => {
    if (event) {
      event.preventDefault()
    }
    showGallery(this.props.street.creatorId, false)
  }

  renderByline = (creatorId) => {
    return (
      <FormattedMessage
        id="users.byline"
        defaultMessage="by {user}"
        values={{
          user: (
            <React.Fragment key={creatorId}>
              <Avatar userId={creatorId} />
              <a href={'/' + creatorId} onClick={this.onClickAuthor}>{creatorId}</a>
            </React.Fragment>
          )
        }}
      />
    )
  }

  render () {
    let author = null
    const creatorId = this.props.street.creatorId
    if (creatorId && (!this.props.signedIn || (creatorId !== this.props.userId))) {
      author = this.renderByline(creatorId)
    } else if (!creatorId && (this.props.signedIn || getRemixOnFirstEdit())) {
      author = t('users.byline', 'by {user}', { user: t('users.anonymous', 'Anonymous') })
    }

    return (
      <IntlProvider
        locale={this.props.locale.locale}
        key={this.props.locale.locale}
        messages={this.props.locale.messages}
      >
        <div className="street-metadata">
          <StreetWidth readOnly={this.props.readOnly} />
          <span className="street-metadata-author">{author}</span>
          <span className="street-metadata-date">{formatDate(this.props.street.updatedAt)}</span>
          <StreetMetaGeotag />
        </div>
      </IntlProvider>
    )
  }
}

function mapStateToProps (state) {
  return {
    signedIn: state.user.signedIn,
    userId: state.user.signInData && state.user.signInData.userId,
    locale: state.locale
  }
}

export default connect(mapStateToProps)(StreetMetaData)
