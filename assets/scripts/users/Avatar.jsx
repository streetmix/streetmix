import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import Axios from 'axios'
import { rememberUserProfile } from '../store/slices/user'
import './Avatar.scss'

Avatar.propTypes = {
  userId: PropTypes.string.isRequired
}

function Avatar ({ userId }) {
  // Uses cached profile image data, if available
  const cachedImageUrl = useSelector(
    (state) => state.user.profileCache?.[userId]?.profileImageUrl || null
  )
  const [imageUrl, setImageUrl] = useState(cachedImageUrl)
  const dispatch = useDispatch()

  useEffect(() => {
    const source = Axios.CancelToken.source()

    async function fetchData () {
      // We need to be able to cancel the Axios request when the
      // component unmounts (this can happen e.g. in tests)
      // https://www.youtube.com/watch?v=_TleXX0mxaY
      try {
        const response = await Axios.get('/api/v1/users/' + userId, {
          cancelToken: source.token
        })

        // Responses are cached so that multiple Avatar components that
        // have the same userId only need to make one request.
        if (response.data) {
          setImageUrl(response.data.profileImageUrl)
          dispatch(rememberUserProfile(response.data))
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
  }, [userId, imageUrl, dispatch])

  return (
    <span className="avatar">
      <img src={imageUrl} alt={userId} />
    </span>
  )
}

export default React.memo(Avatar)
