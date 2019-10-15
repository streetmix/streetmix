import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Axios from 'axios'
import { API_URL } from '../app/config'
import { rememberUserProfile } from '../store/actions/user'
import './Avatar.scss'

Avatar.propTypes = {
  userId: PropTypes.string.isRequired,
  cachedImageUrl: PropTypes.string,
  rememberUserProfile: PropTypes.func
}

function Avatar (props) {
  const {
    userId,
    cachedImageUrl,
    rememberUserProfile = () => {}
  } = props
  const [imageUrl, setImageUrl] = useState(cachedImageUrl)

  useEffect(() => {
    const source = Axios.CancelToken.source()

    async function fetchData () {
      // We need to be able to cancel the Axios request when the
      // component unmounts (this can happen e.g. in tests)
      // https://www.youtube.com/watch?v=_TleXX0mxaY
      try {
        const response = await Axios.get(API_URL + 'v1/users/' + userId, {
          cancelToken: source.token
        })

        // Responses are cached so that multiple Avatar components that
        // have the same userId only need to make one request.
        if (response.data) {
          setImageUrl(response.data.profileImageUrl)
          rememberUserProfile(response.data)
        }
      } catch (error) {
        if (Axios.isCancel(error)) {
          // Quietly swallow a cancelled request
        } else {
          throw error
        }
      }
    }

    if (!imageUrl) {
      fetchData()
    }

    return () => {
      source.cancel()
    }
  }, [userId, imageUrl, rememberUserProfile])

  return (
    <div className="avatar">
      <img src={imageUrl} alt={userId} />
    </div>
  )
}

// Retrieves cached profile image data, if available
function mapStateToProps (state, ownProps) {
  const { userId } = ownProps
  const cache = state.user.profileCache

  return {
    cachedImageUrl: (cache && cache[userId] && cache[userId].profileImageUrl) || null
  }
}

const mapDispatchToProps = {
  rememberUserProfile
}

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(Avatar))
