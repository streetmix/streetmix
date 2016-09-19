import React from 'react'
import { API_URL } from '../app/config'

const avatarCache = {}
const requests = {}

export default class Avatar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      backgroundImage: (this.props.userId && avatarCache[this.props.userId] ? avatarCache[this.props.userId] : 'none')
    }

    this.fetchAvatar = this.fetchAvatar.bind(this)
    this.checkCache = this.checkCache.bind(this)
  }

  componentDidMount () {
    window.addEventListener('stmx:user_details_loaded', this.checkCache)
    if (this.props.userId && !avatarCache[this.props.userId]) {
      this.fetchAvatar()
    }
  }

  componentDidUpdate () {
    if (this.props.userId && !avatarCache[this.props.userId]) {
      this.fetchAvatar()
    }
  }

  fetchAvatar () {
    if (avatarCache[this.props.userId] || !this.props.userId) {
      return
    }

    if (requests[this.props.userId]) {
      // we already have a request for this user id
      // so let the first request handle it and throw an event
      return
    }

    requests[this.props.userId] = window.fetch(API_URL + 'v1/users/' + this.props.userId)
    .then(function (response) {
      if (response.status !== 200) {
        throw new Error('status code ' + response.status)
      }

      return response.json()
    })
    .then(Avatar.receiveAvatar)
    .then(this.checkCache)
    .then(() => {
      // throw an event so other Avatar instances can check if the user they need was loaded
      window.dispatchEvent(new CustomEvent('stmx:user_details_loaded'))
    })
    .catch((err) => {
      console.error('error loading avatar for ' + this.props.userId + ':', err)
    })
  }

  // keep this static so that other code can add profile iamges to the cache (namely user auth)
  static receiveAvatar (details) {
    if (details && details.id && details.profileImageUrl) {
      avatarCache[details.id] = details.profileImageUrl
    }
  }

  checkCache () {
    if (this.props.userId && avatarCache[this.props.userId]) {
      this.setState({
        backgroundImage: avatarCache[this.props.userId]
      })
    }
  }

  render () {
    var style = {backgroundImage: 'url(' + this.state.backgroundImage + ')'}
    return (
      <div className='avatar' style={style} />
    )
  }
}

Avatar.propTypes = {
  userId: React.PropTypes.string
}

