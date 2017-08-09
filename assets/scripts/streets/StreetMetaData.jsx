import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { formatDate } from '../util/date_format'
import { msg } from '../app/messages'
import { getRemixOnFirstEdit } from './remix'
import { showGallery } from '../gallery/view'
import StreetWidth from './StreetWidth'
import Avatar from '../app/Avatar'
import Geolocation from './Geolocation'

class StreetMetaData extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      street: this.props.street,
      showMap: false
    }
    this.onClickAuthor = this.onClickAuthor.bind(this)
    this.onClick = this.onClick.bind(this)
  }

  onClick (e) {
    e.preventDefault()
    this.setState({showMap: !this.state.showMap})
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

    const geolocation = (this.props.experimental) ? (
      <span>
        <a id='street-metadata-map' onClick={this.onClick}><u>Geolocation!</u></a>
        {this.state.showMap && <Geolocation />}
      </span>
    ) : null

    return (
      <div id={this.props.id}>
        <StreetWidth street={this.state.street} readOnly={this.props.readOnly} />
        <span id='street-metadata-author'>{author}</span>
        <span id='street-metadata-date'>{formatDate(this.state.street.updatedAt)}</span>
        {geolocation}
      </div>
    )
  }
}

StreetMetaData.propTypes = {
  id: PropTypes.string,
  readOnly: PropTypes.bool,
  street: PropTypes.any,
  signedIn: PropTypes.bool.isRequired,
  userId: PropTypes.string,
  experimental: PropTypes.bool
}

StreetMetaData.defaultProps = {
  userId: ''
}

function mapStateToProps (state) {
  return {
    signedIn: state.user.signedIn,
    userId: state.user.signInData && state.user.signInData.userId,
    experimental: state.debug.experimental
  }
}

export default connect(mapStateToProps)(StreetMetaData)
