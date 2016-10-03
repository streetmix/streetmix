import React from 'react'
import { formatDate } from '../util/date_format'
import { msg } from '../app/messages'
import { getSignInData, isSignedIn } from '../users/authentication'
import { getRemixOnFirstEdit } from './remix'
import { showGallery } from '../gallery/view'
import StreetWidth from './StreetWidth'
import Avatar from '../app/Avatar'

export default class StreetMetaData extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      street: this.props.street
    }
    this.onClickAuthor = this.onClickAuthor.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      street: nextProps.street
    })
  }

  onClickAuthor (e) {
    if (e) {
      e.preventDefault()
    }
    showGallery(this.state.street.creatorId, false)
  }

  render () {
    let author = null
    const creatorId = this.state.street.creatorId
    if (creatorId && (!isSignedIn() || (creatorId !== getSignInData().userId))) {
      author = <span>
        by <Avatar userId={creatorId} />
        <a className='user-gallery' href={'/' + creatorId} onClick={this.onClickAuthor}>{creatorId}</a>
      </span>
    } else if (!creatorId && (isSignedIn() || getRemixOnFirstEdit())) {
      author = <span>by {msg('USER_ANONYMOUS')}</span>
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

