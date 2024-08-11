import React, { useCallback } from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector, useDispatch } from '../store/hooks'
import { openGallery } from '../store/actions/gallery'
import Button from '../ui/Button'

function GalleryError (): React.ReactElement {
  const userId = useSelector((state) => state.gallery.userId)
  const dispatch = useDispatch()

  const handleRetry = useCallback(() => {
    void dispatch(openGallery({ userId }))
  }, [userId, dispatch])

  return (
    <div className="gallery-error">
      <p>
        <FormattedMessage
          id="gallery.fail"
          defaultMessage="Failed to load the gallery."
        />
      </p>
      <Button onClick={handleRetry}>
        <FormattedMessage id="btn.try-again" defaultMessage="Try again" />
      </Button>
    </div>
  )
}

export default GalleryError
