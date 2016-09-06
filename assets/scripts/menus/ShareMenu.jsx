import React from 'react'
import ReactDOM from 'react-dom'
import Menu from './Menu'
import SaveAsImageDialog from '../dialogs/SaveAsImageDialog'

import { t } from '../app/locale'
import { FACEBOOK_APP_ID } from '../app/config'
import { getSignInData, isSignedIn } from '../users/authentication'
import { trackEvent } from '../app/event_tracking'
import { getPageTitle } from '../app/page_title'
import { printImage } from '../app/print'
import { getStreet } from '../streets/data_model'
import { getSharingUrl } from '../util/share_url'

function _getSharingMessage () {
  let message = ''
  let street = getStreet()

  if (street.creatorId) {
    if (isSignedIn() && street.creatorId === getSignInData().userId) {
      message = `Check out my street, ${street.name}, on Streetmix!`
    } else {
      message = `Check out ${street.name} by @${street.creatorId} on Streetmix!`
    }
  } else {
    message = `Check out ${street.name} on Streetmix!`
  }

  return message
}

export default class ShareMenu extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      shareUrl: ''
    }

    this.update = this.update.bind(this)
    this.updateLinks = this.updateLinks.bind(this)
    this.updateSignInPromo = this.updateSignInPromo.bind(this)
    this.onShow = this.onShow.bind(this)
  }

  componentDidMount () {
    this.update()
  }

  update () {
    this.updateLinks()
    this.updateSignInPromo()
  }

  updateLinks () {
    const url = getSharingUrl()

    this.setState({ shareUrl: url })
  }

  updateSignInPromo () {
    if (!isSignedIn()) {
      this.signInPromo.classList.add('visible')
    } else {
      this.signInPromo.classList.remove('visible')
    }
  }

  onShow () {
    // Make sure links are updated when the menu is opened
    this.update()

    // Auto-focus and select link when share menu is active
    window.setTimeout(() => {
      this.shareViaLinkInput.focus()
      this.shareViaLinkInput.select()
    }, 200)
  }

  onClickShareViaTwitter () {
    trackEvent('SHARING', 'TWITTER', null, null, false)
  }

  onClickShareViaFacebook () {
    trackEvent('SHARING', 'FACEBOOK', null, null, false)
  }

  onClickSaveAsImage (event) {
    event.preventDefault()
    ReactDOM.render(<SaveAsImageDialog />, document.getElementById('dialogs-react'))
  }

  render () {
    const shareText = _getSharingMessage()
    const twitterLink = 'https://twitter.com/intent/tweet' +
      '?text=' + encodeURIComponent(shareText) +
      '&url=' + encodeURIComponent(this.state.shareUrl)

    const facebookLink = 'https://www.facebook.com/dialog/feed' +
      '?app_id=' + encodeURIComponent(FACEBOOK_APP_ID) +
      '&redirect_uri=' + encodeURIComponent(this.state.shareUrl) +
      '&link=' + encodeURIComponent(this.state.shareUrl) +
      '&name=' + encodeURIComponent(getPageTitle()) +
      '&description=' + encodeURIComponent(shareText)

    return (
      <Menu name='share' alignment='right' onShow={this.onShow} className='share-menu' {...this.props}>
        <div
          className='share-sign-in-promo'
          data-i18n='menu.share.sign-in'
          ref={(ref) => { this.signInPromo = ref }}
        >
          <a href='/twitter-sign-in?redirectUri=/just-signed-in'>Sign in with
          Twitter</a> for nicer links to your streets and your personal
          street gallery
        </div>
        <div className='share-via-link-container'>
          <span data-i18n='menu.share.link'>
            Copy and paste this link to share:
          </span>
          <input
            className='share-via-link'
            type='text'
            value={this.state.shareUrl}
            spellCheck='false'
            ref={(ref) => { this.shareViaLinkInput = ref }}
          />
        </div>
        <a
          className='share-via-twitter'
          href={twitterLink}
          target='_blank'
          onClick={this.onClickShareViaTwitter}
        >
          <svg className='icon'>
            <use xlinkHref='#icon-twitter' />
          </svg>
          <span data-i18n='menu.share.twitter'>Share using Twitter</span>
        </a>
        <a
          className='share-via-facebook'
          href={facebookLink}
          target='_blank'
          onClick={this.onClickShareViaFacebook}
        >
          <svg className='icon'>
            <use xlinkHref='#icon-facebook' />
          </svg>
          <span data-i18n='menu.share.facebook'>Share using Facebook</span>
        </a>
        <a href='#' onClick={printImage}>
          <span data-i18n='menu.share.print'>Print…</span>
        </a>
        <a id='save-as-image' href='#' onClick={this.onClickSaveAsImage}>
          <span data-i18n='menu.share.save'>Save as image…</span>
          <span data-i18n='menu.share.save-byline' className='menu-item-subtext'>
            For including in a report, blog, etc.
          </span>
        </a>
      </Menu>
    )
  }
}
