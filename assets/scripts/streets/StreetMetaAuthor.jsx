import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { getRemixOnFirstEdit } from './remix'
import { showGallery } from '../gallery/view'
import { t } from '../app/locale'
import Avatar from '../users/Avatar'

export class StreetMetaAuthor extends React.Component {
  static propTypes = {
    signedIn: PropTypes.bool.isRequired,
    userId: PropTypes.string,
    street: PropTypes.any
  }

  static defaultProps = {
    userId: ''
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

    return <span className="street-metadata-author">{author}</span>
  }
}

function mapStateToProps (state) {
  return {
    street: state.street,
    signedIn: state.user.signedIn,
    userId: state.user.signInData && state.user.signInData.userId
  }
}

export default connect(mapStateToProps)(StreetMetaAuthor)
