import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { openGallery } from '../store/actions/gallery'
import Button from '../ui/Button'

function GalleryError ({ showTryAgain = true }) {
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
      {showTryAgain && (
        <Button onClick={handleRetry}>
          <FormattedMessage id="btn.try-again" defaultMessage="Try again" />
        </Button>
      )}
    </div>
  )
}

GalleryError.propTypes = {
  showTryAgain: PropTypes.bool
}

export default GalleryError
