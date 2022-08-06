import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { rememberUserProfile } from '../store/slices/user'
import { getUser } from '../util/api'
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
    const controller = new AbortController()

    async function fetchData () {
      // We need to be able to cancel the Axios request when the
      // component unmounts (this can happen e.g. in tests)
      // https://axios-http.com/docs/cancellation
      try {
        const response = await getUser(userId, {
          signal: controller.signal
        })

        // Responses are cached so that multiple Avatar components that
        // have the same userId only need to make one request.
        if (response.data) {
          setImageUrl(response.data.profileImageUrl)
          dispatch(rememberUserProfile(response.data))
        }
      } catch (error) {
        // Quietly swallow a cancelled request
        controller.abort()
      }
    }

    if (!imageUrl) {
      fetchData()
    }

    return () => {
      controller.abort()
    }
  }, [userId, imageUrl, dispatch])

  return (
    <span className="avatar">
      <img src={imageUrl} alt={userId} />
    </span>
  )
}

export default React.memo(Avatar)
