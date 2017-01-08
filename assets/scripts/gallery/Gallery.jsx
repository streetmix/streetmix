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

export default class Gallery extends React.Component {
  render () {
    let childElements

    if (this.props.signInPromo === true) {
      childElements = (
        <div id='gallery'>
          <div className='sign-in-promo'>
            <a href='/twitter-sign-in?redirectUri=/just-signed-in'>Sign in with Twitter</a> for your personal street gallery
          </div>
        </div>
      )
    } else {
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
              >
                Twitter profile »
              </a>
            </div>
          </div>
        )
      } else {
        label = <div className='gallery-label'>All streets</div>
      }

      childElements = (
        <div id='gallery'>
          <div className='loading' data-i18n='msg.loading'>Loading…</div>
          <div className='error-loading'>
            <span data-i18n='gallery.fail'>Failed to load the gallery.</span>
            <button id='gallery-try-again' data-i18n='btn.try-again'>Try again</button>
          </div>

          {label}

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

    return childElements
  }
}

Gallery.propTypes = {
  visible: React.PropTypes.bool,
  userId: React.PropTypes.string,
  signInPromo: React.PropTypes.bool
}

function mapStateToProps (state) {
  return {
    visible: state.gallery.visible,
    userId: state.gallery.userId,
    signInPromo: state.gallery.signInPromo
  }
}

export default connect(mapStateToProps)(Gallery)
