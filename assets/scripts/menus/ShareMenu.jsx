import React from 'react'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Menu from './Menu'

import { FACEBOOK_APP_ID } from '../app/config'
import { trackEvent } from '../app/event_tracking'
import { getPageTitle } from '../app/page_title'
import { printImage } from '../app/print'
import { getSharingUrl } from '../util/share_url'
import { showDialog } from '../store/actions/dialogs'

export class ShareMenu extends React.Component {
  static propTypes = {
    showDialog: PropTypes.func.isRequired,
    signedIn: PropTypes.bool.isRequired,
    userId: PropTypes.string,
    street: PropTypes.object
  }

  static defaultProps = {
    userId: ''
  }

  constructor (props) {
    super(props)

    this.state = {
      shareUrl: ''
    }
  }

  componentDidMount () {
    this.updateLinks()
  }

  updateLinks = () => {
    const url = getSharingUrl()

    this.setState({ shareUrl: url })
  }

  getSharingMessage = () => {
    let message = ''
    const street = this.props.street

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

  onShow = () => {
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

  onClickSaveAsImage = (event) => {
    event.preventDefault()
    this.props.showDialog()
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
      '&name=' + encodeURIComponent(getPageTitle(this.props.street)) +
      '&description=' + encodeURIComponent(shareText)

    const signInPromo = (!this.props.signedIn)
      ? (
        <div className="share-sign-in-promo">
          <FormattedHTMLMessage
            id="menu.share.sign-in"
            defaultMessage="<a href='/twitter-sign-in?redirectUri=/just-signed-in'>Sign in with Twitter</a> for nicer links to your streets and your personal street gallery"
          />
        </div>
      ) : null

    return (
      <Menu alignment="right" onShow={this.onShow} className="share-menu" {...this.props}>
        {signInPromo}
        <div className="share-via-link-container">
          <FormattedMessage id="menu.share.link" defaultMessage="Copy and paste this link to share:" />
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
          rel="noopener noreferrer"
          onClick={this.onClickShareViaTwitter}
        >
          <svg className="icon">
            <use xlinkHref="#icon-twitter" />
          </svg>
          <FormattedMessage id="menu.share.twitter" defaultMessage="Share using Twitter" />
        </a>
        <a
          className="share-via-facebook"
          href={facebookLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={this.onClickShareViaFacebook}
        >
          <svg className="icon">
            <use xlinkHref="#icon-facebook" />
          </svg>
          <FormattedMessage id="menu.share.facebook" defaultMessage="Share using Facebook" />
        </a>
        <a href="#" onClick={printImage}>
          <FormattedMessage id="menu.share.print" defaultMessage="Print…" />
        </a>
        <a id="save-as-image" href="#" onClick={this.onClickSaveAsImage}>
          <FormattedMessage id="menu.share.save" defaultMessage="Save as image…" />
          <span className="menu-item-subtext">
            <FormattedMessage id="menu.share.save-byline" defaultMessage="For including in a report, blog, etc." />
          </span>
        </a>
      </Menu>
    )
  }
}

function mapStateToProps (state) {
  return {
    signedIn: state.user.signedIn,
    userId: state.user.signInData && state.user.signInData.userId,
    street: state.street
  }
}

function mapDispatchToProps (dispatch) {
  return {
    showDialog: () => { dispatch(showDialog('SAVE_AS_IMAGE')) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ShareMenu)
