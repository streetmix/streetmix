import { useCallback } from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector, useDispatch } from '../store/hooks.js'
import { openGallery } from '../store/actions/gallery.js'
import { Button } from '../ui/Button.js'

export function GalleryError() {
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
      <Button onClick={handleRetry}>
        <FormattedMessage id="btn.try-again" defaultMessage="Try again" />
      </Button>
    </div>
  )
}
