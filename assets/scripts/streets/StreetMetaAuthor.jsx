import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { getRemixOnFirstEdit } from './remix'
import { showGallery } from '../gallery/view'
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

  handleClickAuthor = (event) => {
    if (event) {
      event.preventDefault()
    }
    showGallery(this.props.street.creatorId, false)
  }

  renderByline = (creatorId) => {
    const user = (creatorId) ? (
      <fragment key={creatorId}>
        <Avatar userId={creatorId} />
        <a href={'/' + creatorId} onClick={this.handleClickAuthor}>{creatorId}</a>
      </fragment>
    ) : (
      <FormattedMessage id="users.anonymous" defaultMessage="Anonymous" />
    )

    return (
      <FormattedMessage
        id="users.byline"
        defaultMessage="by {user}"
        values={{ user }}
      />
    )
  }

  render () {
    let author = null
    const creatorId = this.props.street.creatorId
    if (creatorId && (!this.props.signedIn || (creatorId !== this.props.userId))) {
      author = this.renderByline(creatorId)
    } else if (!creatorId && (this.props.signedIn || getRemixOnFirstEdit())) {
      author = this.renderByline(null)
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
