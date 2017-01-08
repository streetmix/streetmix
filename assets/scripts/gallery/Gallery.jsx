/**
 * Gallery
 *
 * Displays a user's streets
 *
 */
import React from 'react'
import Scrollable from '../ui/Scrollable'

export default class Gallery extends React.Component {
  render () {
    return (
      <div id='gallery'>
        <div className='loading' data-i18n='msg.loading'>Loading…</div>
        <div className='error-loading'>
          <span data-i18n='gallery.fail'>Failed to load the gallery.</span>
          <button id='gallery-try-again' data-i18n='btn.try-again'>Try again</button>
        </div>
        <div className='sign-in-promo'>
          <a href='/twitter-sign-in?redirectUri=/just-signed-in'>Sign in with Twitter</a> for your personal street gallery
        </div>
        <div className='avatar-wrap' />
        <div className='user-id' />
        <div className='street-count' />
        <a className='button-like' id='new-street' href='#' target='_blank' data-i18n='btn.create'>
          Create new street
        </a>
        <a className='button-like' id='copy-last-street' href='#' target='_blank' data-i18n='btn.copy'>
          Make a copy
        </a>

        <Scrollable className='streets' />
      </div>
    )
  }
}
