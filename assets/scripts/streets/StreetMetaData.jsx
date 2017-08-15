import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { formatDate } from '../util/date_format'
import { msg } from '../app/messages'
import { getRemixOnFirstEdit } from './remix'
import { showGallery } from '../gallery/view'
import store from '../store'
import StreetWidth from './StreetWidth'
import Avatar from '../app/Avatar'
import { SHOW_DIALOG } from '../store/actions'
import Geolocation from './Geolocation'

class StreetMetaData extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      street: this.props.street
    }
    this.onClickAuthor = this.onClickAuthor.bind(this)
    this.onClick = this.onClick.bind(this)
  }

  onClick (e) {
    e.preventDefault()
    store.dispatch({
      type: SHOW_DIALOG,
      name: 'MAP'
    })
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
    if (creatorId && (!this.props.signedIn || (creatorId !== this.props.userId))) {
      author = <span>
        by <Avatar userId={creatorId} />
        <a className='user-gallery' href={'/' + creatorId} onClick={this.onClickAuthor}>{creatorId}</a>
      </span>
    } else if (!creatorId && (this.props.signedIn || getRemixOnFirstEdit())) {
      author = <span>by {msg('USER_ANONYMOUS')}</span>
    }

    return (
      <div id={this.props.id}>
        <StreetWidth street={this.state.street} readOnly={this.props.readOnly} />
        <span id='street-metadata-author'>{author}</span>
        <span id='street-metadata-date'>{formatDate(this.state.street.updatedAt)}</span>
        <a id='street-metadata-map' onClick={this.onClick}><u>Geolocation!</u></a>
        {this.state.showMap && <Geolocation closeMap={this.closeMap} />}

      </div>
    )
  }
}

StreetMetaData.propTypes = {
  id: PropTypes.string,
  readOnly: PropTypes.bool,
  street: PropTypes.any,
  signedIn: PropTypes.bool.isRequired,
  userId: PropTypes.string
}

StreetMetaData.defaultProps = {
  userId: ''
}

function mapStateToProps (state) {
  return {
    signedIn: state.user.signedIn,
    userId: state.user.signInData && state.user.signInData.userId
  }
}

export default connect(mapStateToProps)(StreetMetaData)
