import React from 'react'
import { API_URL } from '../app/config'
import { receiveUserDetails, hasCachedProfileImageUrl, getCachedProfileImageUrl } from '../users/profile_image_cache'

const requests = {}

export default class Avatar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      backgroundImage: (this.props.userId && getCachedProfileImageUrl(this.props.userId)) || null
    }

    this.fetchAvatar = this.fetchAvatar.bind(this)
    this.checkCache = this.checkCache.bind(this)
  }

  componentDidMount () {
    window.addEventListener('stmx:user_details_received', this.checkCache)
    if (this.props.userId && !hasCachedProfileImageUrl(this.props.userId)) {
      this.fetchAvatar()
    }
    this.checkCache()
  }

  componentDidUpdate () {
    if (this.props.userId && !hasCachedProfileImageUrl(this.props.userId)) {
      this.fetchAvatar()
    }
    this.checkCache()
  }

  fetchAvatar () {
    if (hasCachedProfileImageUrl(this.props.userId) || !this.props.userId) {
      return
    }

    if (requests[this.props.userId]) {
      // we already have a request for this user id
      // so let the first request handle it and throw an event
      return
    }

    requests[this.props.userId] = window.fetch(API_URL + 'v1/users/' + this.props.userId)
    .then(function (response) {
      // Ignore 404 errors; this happens frequently in staging/dev environments.
      if (response.status === 404) {
        return
      } else if (response.status !== 200) {
        throw new Error('status code ' + response.status)
      }

      return response.json()
    })
    .then(receiveUserDetails)
    .then(this.checkCache)
    .catch((err) => {
      console.error('error loading avatar for ' + this.props.userId + ':', err)
    })
  }

  checkCache () {
    const cachedProfileImageUrl = getCachedProfileImageUrl(this.props.userId)
    if (this.props.userId && cachedProfileImageUrl && this.state.backgroundImage !== cachedProfileImageUrl) {
      this.setState({
        backgroundImage: cachedProfileImageUrl
      })
    }
  }

  render () {
    const style = {
      backgroundImage: this.state.backgroundImage ? 'url(' + this.state.backgroundImage + ')' : 'none'
    }
    return (
      <div className='avatar' style={style} />
    )
  }
}

Avatar.propTypes = {
  userId: React.PropTypes.string
}
