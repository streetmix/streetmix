import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { API_URL } from '../app/config'
import { rememberUserProfile } from '../store/actions/user'

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

    this.image = null
    this.state = {
      image: this.getCachedProfileImageUrl(this.props.userId) || null
    }
  }

  componentDidMount () {
    // If a profile image had not been cached, initiate a fetch of it
    if (!this.state.image) {
      const url = this.getCachedProfileImageUrl(this.props.userId)
      if (url) {
        this.testImageUrl(url)
      } else {
        this.fetchAvatar(this.props.userId)
      }
    }
  }

  // Clean up residual image references and listeners before unmounting.
  componentWillUnmount () {
    if (this.image !== null) {
      this.image.onerror = null
      this.image.onload = null
    }
    this.image = null
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

    // If request was already made and cached, use it
    if (details) {
      this.props.rememberUserProfile(details)
      this.testImageUrl(details.profileImageUrl)
    } else {
      // If the request hasn't been made and cached, do that now.
      // Use try / catch to handle rejections from Fetch
      try {
        requests[userId] = window.fetch(API_URL + 'v1/users/' + userId)

        const response = await requests[userId]
        if (response.ok) {
          const data = await response.json()
          this.props.rememberUserProfile(data)
          this.testImageUrl(data.profileImageUrl)
        } else {
          // Reject responses with a non-OK HTTP status code
          throw new Error(requests[userId].status)
        }
      } catch (error) {
        this.setState({ image: null })
      }
    }
  }

  // Loads the image source url in a <img> element to test its validity.
  // If it's good, we set it, otherwise, we record an error. Note that the
  // event handlers call `setState` within them, which throws a warning if
  // these handlers are called after the component is unmounted. We must
  // clean up these handlers and the reference to the image element in
  // `componentWillUnmount`.
  testImageUrl = (url) => {
    // Bail if the `url` argument is a falsy value
    if (!url) {
      this.setState({ image: null })
    }

    this.image = document.createElement('img')
    this.image.onerror = () => {
      this.setState({ image: null })
      this.image = null
    }
    this.image.onload = () => {
      this.setState({ image: url })
      this.image = null
    }
    this.image.src = url
  }

  render () {
    const state = this.state
    const style = {}
    let className = 'avatar'

    // Displays the avatar image if we have it!
    if (state.image) {
      style.backgroundImage = `url(${state.image})`
    } else {
      className += ' avatar-blank'
    }

    return (
      <div className={className} style={style} />
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
