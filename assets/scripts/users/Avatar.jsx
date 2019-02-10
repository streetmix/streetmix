import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { API_URL } from '../app/config'
import { rememberUserProfile } from '../store/actions/user'
import './Avatar.scss'

// Requests are cached so that multiple Avatar components that have the
// same userId only need to make one request. Requests are cached separately
// from user profile data because this also remembers a failed request (and
// won't make subsequent requests if it failed previously.)
const requests = {}

export class Avatar extends React.PureComponent {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    profileCache: PropTypes.object,
    rememberUserProfile: PropTypes.func
  }

  static defaultProps = {
    rememberUserProfile: () => {}
  }

  constructor (props) {
    super(props)

    this.state = {
      image: null
    }
  }

  async componentDidMount () {
    // If a profile image had not been cached, initiate a fetch of it
    let url = this.getCachedProfileImageUrl(this.props.userId)

    if (!url) {
      url = await this.fetchAvatar(this.props.userId)
    }

    this.setState({ image: url })
  }

  getCachedProfileImageUrl = (userId) => {
    try {
      return this.props.profileCache[userId].profileImageUrl
    } catch (error) {
      return null
    }
  }

  fetchAvatar = async (userId) => {
    const details = await requests[userId]
    let url

    // If request was already made and cached, use it
    if (details) {
      this.props.rememberUserProfile(details)
      url = details.profileImageUrl
    } else {
      // If the request hasn't been made and cached, do that now.
      // Use try / catch to handle rejections from Fetch
      try {
        requests[userId] = window.fetch(API_URL + 'v1/users/' + userId)

        const response = await requests[userId]
        if (response.ok) {
          const data = await response.json()
          this.props.rememberUserProfile(data)
          url = data.profileImageUrl
        } else {
          // Reject responses with a non-OK HTTP status code
          throw new Error(requests[userId].status)
        }
      } catch (error) {
        this.setState({ image: null })
      }
    }

    return url
  }

  render () {
    return (
      <div className="avatar">
        <img src={this.state.image} alt={this.props.userId} />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    profileCache: state.user.profileCache
  }
}

function mapDispatchToProps (dispatch) {
  return {
    rememberUserProfile: (profile) => { dispatch(rememberUserProfile(profile)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Avatar)
