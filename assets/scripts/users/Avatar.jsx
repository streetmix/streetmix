import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'
import { API_URL } from '../app/config'
import { rememberUserProfile } from '../store/actions/user'
import './Avatar.scss'

function Avatar (props) {
  const { userId, image, rememberUserProfile } = props

  useEffect(() => {
    async function fetchData () {
      const response = await axios(API_URL + 'v1/users/' + userId)

      // Responses are cached so that multiple Avatar components that
      // have the same userId only need to make one request.
      if (response.data) {
        rememberUserProfile(response.data)
      }
    }

    if (!image) {
      fetchData()
    }
  }, [ image, userId, rememberUserProfile ])

  return (
    <div className="avatar">
      <img src={image} alt={userId} />
    </div>
  )
}

Avatar.propTypes = {
  userId: PropTypes.string.isRequired,
  image: PropTypes.string,
  rememberUserProfile: PropTypes.func
}

Avatar.defaultProps = {
  rememberUserProfile: () => {}
}

// Retrieves cached profile image data, if available
function mapStateToProps (state, ownProps) {
  const { userId } = ownProps
  const cache = state.user.profileCache

  return {
    image: (cache[userId] && cache[userId].profileImageUrl) || null
  }
}

const mapDispatchToProps = {
  rememberUserProfile
}

export default connect(mapStateToProps, mapDispatchToProps)(Avatar)
