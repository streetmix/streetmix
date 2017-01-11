/**
 * Gallery
 *
 * Displays a user's streets
 *
 */
import React from 'react'
import { connect } from 'react-redux'
import Scrollable from '../ui/Scrollable'
import Avatar from '../app/Avatar'
import { repeatReceiveGalleryData } from './view'
import { URL_NEW_STREET, URL_NEW_STREET_COPY_LAST } from '../app/routing'

export default class Gallery extends React.Component {
  render () {
    let childElements

    switch (this.props.mode) {
      case 'SIGN_IN_PROMO':
        childElements = (
          <div className='gallery-sign-in-promo'>
            <a href='/twitter-sign-in?redirectUri=/just-signed-in'>Sign in with Twitter for your personal street gallery</a>
          </div>
        )
        break
      case 'LOADING':
        childElements = (
          <div className='gallery-loading' data-i18n='msg.loading'>Loading…</div>
        )
        break
      case 'ERROR':
        childElements = (
          <div className='gallery-error'>
            <span data-i18n='gallery.fail'>Failed to load the gallery.</span>
            <button id='gallery-try-again' data-i18n='btn.try-again' onClick={repeatReceiveGalleryData}>Try again</button>
          </div>
        )
        break
      case 'GALLERY':
      default:
        let label

        // Displays user avatar and twitter link if showing a user's streets,
        // otherwise it shows the label "all streets"
        if (this.props.userId) {
          label = (
            <div className='gallery-label'>
              <Avatar userId={this.props.userId} />
              <div className='gallery-user-id'>
                {this.props.userId}
                <a
                  href={`https://twitter.com/${this.props.userId}`}
                  className='twitter-profile'
                  target='_blank'
                  data-i18n='gallery.twitter-link'
                >
                  Twitter profile »
                </a>
              </div>
            </div>
          )
        } else {
          label = <div className='gallery-label' data-i18n='gallery.all'>All streets</div>
        }

        childElements = (
          <div>
            {label}

            <div className='street-count' />
            <a className='button-like' id='new-street' href={`/${URL_NEW_STREET}`} target='_blank' data-i18n='btn.create'>
              Create new street
            </a>
            <a className='button-like' id='copy-last-street' href={`/${URL_NEW_STREET_COPY_LAST}`} target='_blank' data-i18n='btn.copy'>
              Make a copy
            </a>

            <Scrollable className='streets' />
          </div>
        )
        break
    }

    return (
      <div id='gallery'>
        {childElements}
      </div>
    )
  }
}

Gallery.propTypes = {
  visible: React.PropTypes.bool,
  userId: React.PropTypes.string,
  mode: React.PropTypes.string
}

function mapStateToProps (state) {
  return {
    visible: state.gallery.visible,
    userId: state.gallery.userId,
    mode: state.gallery.mode
  }
}

export default connect(mapStateToProps)(Gallery)
