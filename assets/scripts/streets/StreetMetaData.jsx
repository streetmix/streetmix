import React from 'react'
import { formatDate } from '../util/date_format'
import { msg } from '../app/messages'
import { getSignInData, isSignedIn } from '../users/authentication'
import { getRemixOnFirstEdit } from './remix'
import { fetchAvatars } from '../users/avatars'
import StreetWidth from './StreetWidth'

export default class StreetMetaData extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      street: this.props.street
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      street: nextProps.street
    })
  }

  componentDidUpdate () {
    // TODO might want to look into changing how this is done
    fetchAvatars()
  }

  render () {

    let author = null
    const creatorId = this.state.street.creatorId
    if (creatorId && (!isSignedIn() || (creatorId !== getSignInData().userId))) {

      // TODO handle clicks on usernames with: showGallery(userId, false)

      author = <span>
          by <div className='avatar' data-user-id={creatorId} />
          <a className='user-gallery' href={'/' + creatorId}>{creatorId}</a>
        </span>
    } else if (!creatorId && (isSignedIn() || getRemixOnFirstEdit())) {
      author = <span> by {msg('USER_ANONYMOUS')} </span>
    }

    return (
      <div id={this.props.id}>
        <StreetWidth street={this.state.street} readOnly={this.props.readOnly} />
        <span id='street-metadata-author'>{author}</span>
        <span id='street-metadata-date'>{formatDate(this.state.street.updatedAt)}</span>
      </div>
    )
  }
}

StreetMetaData.propTypes = {
  id: React.PropTypes.string,
  readOnly: React.PropTypes.bool,
  street: React.PropTypes.any
}

