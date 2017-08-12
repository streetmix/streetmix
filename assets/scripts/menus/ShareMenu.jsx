import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Menu from './Menu'

import { t } from '../app/locale'
import { FACEBOOK_APP_ID } from '../app/config'
import { trackEvent } from '../app/event_tracking'
import { getPageTitle } from '../app/page_title'
import { printImage } from '../app/print'
import { getStreet } from '../streets/data_model'
import { getSharingUrl } from '../util/share_url'
import { SHOW_DIALOG } from '../store/actions'

class ShareMenu extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      shareUrl: ''
    }

    this.updateLinks = this.updateLinks.bind(this)
    this.getSharingMessage = this.getSharingMessage.bind(this)
    this.onShow = this.onShow.bind(this)
    this.onClickSaveAsImage = this.onClickSaveAsImage.bind(this)
  }

  componentDidMount () {
    this.updateLinks()
  }

  updateLinks () {
    const url = getSharingUrl()

    this.setState({ shareUrl: url })
  }

  getSharingMessage () {
    let message = ''
    let street = getStreet()

    if (street.creatorId) {
      if (this.props.signedIn && street.creatorId === this.props.userId) {
        message = `Check out my street, ${street.name}, on Streetmix!`
      } else {
        message = `Check out ${street.name} by @${street.creatorId} on Streetmix!`
      }
    } else {
      message = `Check out ${street.name} on Streetmix!`
    }

    return message
  }

  onShow () {
    // Make sure links are updated when the menu is opened
    this.updateLinks()

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
    this.props.dispatch({
      type: SHOW_DIALOG,
      name: 'SAVE_AS_IMAGE'
    })
  }

  render () {
    const shareText = this.getSharingMessage()
    const twitterLink = 'https://twitter.com/intent/tweet' +
      '?text=' + encodeURIComponent(shareText) +
      '&url=' + encodeURIComponent(this.state.shareUrl)

    const facebookLink = 'https://www.facebook.com/dialog/feed' +
      '?app_id=' + encodeURIComponent(FACEBOOK_APP_ID) +
      '&redirect_uri=' + encodeURIComponent(this.state.shareUrl) +
      '&link=' + encodeURIComponent(this.state.shareUrl) +
      '&name=' + encodeURIComponent(getPageTitle()) +
      '&description=' + encodeURIComponent(shareText)

    const signInPromo = (!this.props.signedIn)
      ? (<div
        className="share-sign-in-promo"
        dangerouslySetInnerHTML={{ __html: t('menu.share.sign-in', '<a href="/twitter-sign-in?redirectUri=/just-signed-in">Sign in with Twitter</a> for nicer links to your streets and your personal street gallery') }}
      />) : null

    return (
      <Menu alignment="right" onShow={this.onShow} className="share-menu" {...this.props}>
        {signInPromo}
        <div className="share-via-link-container">
          <span data-i18n="menu.share.link">
            Copy and paste this link to share:
          </span>
          <input
            className="share-via-link"
            type="text"
            value={this.state.shareUrl}
            spellCheck="false"
            ref={(ref) => { this.shareViaLinkInput = ref }}
          />
        </div>
        <a
          className="share-via-twitter"
          href={twitterLink}
          target="_blank"
          onClick={this.onClickShareViaTwitter}
        >
          <svg className="icon">
            <use xlinkHref="#icon-twitter" />
          </svg>
          <span data-i18n="menu.share.twitter">Share using Twitter</span>
        </a>
        <a
          className="share-via-facebook"
          href={facebookLink}
          target="_blank"
          onClick={this.onClickShareViaFacebook}
        >
          <svg className="icon">
            <use xlinkHref="#icon-facebook" />
          </svg>
          <span data-i18n="menu.share.facebook">Share using Facebook</span>
        </a>
        <a href="#" onClick={printImage}>
          <span data-i18n="menu.share.print">Print…</span>
        </a>
        <a id="save-as-image" href="#" onClick={this.onClickSaveAsImage}>
          <span data-i18n="menu.share.save">Save as image…</span>
          <span data-i18n="menu.share.save-byline" className="menu-item-subtext">
            For including in a report, blog, etc.
          </span>
        </a>
      </Menu>
    )
  }
}

ShareMenu.propTypes = {
  dispatch: PropTypes.func.isRequired, // supplied by connect()
  signedIn: PropTypes.bool.isRequired,
  userId: PropTypes.string
}

ShareMenu.defaultProps = {
  userId: ''
}

function mapStateToProps (state) {
  return {
    signedIn: state.user.signedIn,
    userId: state.user.signInData && state.user.signInData.userId
  }
}

export default connect(mapStateToProps)(ShareMenu)
