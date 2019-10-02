import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

GallerySignInPromo.propTypes = {
  hideGallery: PropTypes.func.isRequired,
  showDialog: PropTypes.func.isRequired
}

function GallerySignInPromo (props) {
  const { hideGallery, showDialog } = props

  function handleSignIn (event) {
    event.preventDefault()
    hideGallery()
    showDialog('SIGN_IN')
  }

  return (
    <div className="gallery-sign-in-promo">
      <a onClick={handleSignIn} href="#">
        <FormattedMessage
          id="gallery.sign-in"
          defaultMessage="Sign in for your personal street gallery"
        />
      </a>
    </div>
  )
}

export default GallerySignInPromo
