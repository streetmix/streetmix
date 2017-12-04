import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { formatDate } from '../util/date_format'
import { t } from '../app/locale'
import { getRemixOnFirstEdit } from './remix'
import { showGallery } from '../gallery/view'
import store from '../store'
import StreetWidth from './StreetWidth'
import Avatar from '../app/Avatar'
import { SHOW_DIALOG } from '../store/actions'

class StreetMetaData extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    readOnly: PropTypes.bool,
    signedIn: PropTypes.bool.isRequired,
    userId: PropTypes.string,
    street: PropTypes.any,
    experimental: PropTypes.bool
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

  onClick (e) {
    e.preventDefault()
    store.dispatch({
      type: SHOW_DIALOG,
      name: 'GEOLOCATE'
    })
  }

  onClickAuthor = (event) => {
    if (event) {
      event.preventDefault()
    }
    showGallery(this.props.street.creatorId, false)
  }

  render () {
    let author = null
    const creatorId = this.props.street.creatorId
    if (creatorId && (!this.props.signedIn || (creatorId !== this.props.userId))) {
      author = <span>
        by <Avatar userId={creatorId} />
        <a className="user-gallery" href={'/' + creatorId} onClick={this.onClickAuthor}>{creatorId}</a>
      </span>
    } else if (!creatorId && (this.props.signedIn || getRemixOnFirstEdit())) {
      author = <span>by {t('users.anonymous', 'Anonymous')}</span>
    }

    const geolocation = (this.props.experimental) ? (
      <span>
        <a id="street-metadata-map" onClick={this.onClick}><u>Geolocation!</u></a>
      </span>
    ) : null

    return (
      <div id={this.props.id}>
        <StreetWidth readOnly={this.props.readOnly} />
        <span id="street-metadata-author">{author}</span>
        <span id="street-metadata-date">{formatDate(this.props.street.updatedAt)}</span>
        {geolocation}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    signedIn: state.user.signedIn,
    userId: state.user.signInData && state.user.signInData.userId,
    experimental: state.debug.experimental
  }
}

export default connect(mapStateToProps)(StreetMetaData)
