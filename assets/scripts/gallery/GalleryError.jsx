import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

GalleryError.propTypes = {
  retry: PropTypes.func.isRequired
}

function GalleryError (props) {
  return (
    <div className="gallery-error">
      <p>
        <FormattedMessage id="gallery.fail" defaultMessage="Failed to load the gallery." />
      </p>
      <button className="gallery-try-again" onClick={props.retry}>
        <FormattedMessage id="btn.try-again" defaultMessage="Try again" />
      </button>
    </div>
  )
}

export default GalleryError
