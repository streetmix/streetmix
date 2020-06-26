import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { openGallery } from '../store/actions/gallery'

function GalleryError (props) {
  const userId = useSelector((state) => state.gallery.userId)
  const dispatch = useDispatch()

  const handleRetry = useCallback(() => {
    dispatch(openGallery({ userId }))
  }, [userId, dispatch])

  return (
    <div className="gallery-error">
      <p>
        <FormattedMessage
          id="gallery.fail"
          defaultMessage="Failed to load the gallery."
        />
      </p>
      <button onClick={handleRetry}>
        <FormattedMessage id="btn.try-again" defaultMessage="Try again" />
      </button>
    </div>
  )
}

export default GalleryError
