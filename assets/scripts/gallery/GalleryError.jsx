import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

GalleryError.propTypes = {
  handleRetry: PropTypes.func.isRequired
}

function GalleryError ({ handleRetry }) {
  return (
    <div className="gallery-error">
      <p>
        <FormattedMessage
          id="gallery.fail"
          defaultMessage="Failed to load the gallery."
        />
      </p>
      <button className="gallery-try-again" onClick={handleRetry}>
        <FormattedMessage id="btn.try-again" defaultMessage="Try again" />
      </button>
    </div>
  )
}

export default GalleryError
