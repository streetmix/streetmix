import React, { useState, useRef, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import copy from 'copy-to-clipboard'
import Menu from './Menu'
import Icon from '../ui/Icon'
import { FACEBOOK_APP_ID } from '../app/config'
import { trackEvent } from '../app/event_tracking'
import { getPageTitle } from '../app/page_title'
import { saveStreetThumbnail, SAVE_THUMBNAIL_EVENTS } from '../streets/image'
import { getSharingUrl } from '../util/share_url'
import { showDialog } from '../store/actions/dialogs'
import { startPrinting } from '../store/actions/app'
import './ShareMenu.scss'

ShareMenu.propTypes = {
  // Provided by Redux mapDispatchToProps
  showDialog: PropTypes.func,
  startPrinting: PropTypes.func,

  // Provided by Redux mapStateToProps
  signedIn: PropTypes.bool.isRequired,
  userId: PropTypes.string,
  street: PropTypes.object
}

function ShareMenu (props) {
  const [shareUrl, setShareUrl] = useState('')
  const shareViaLinkInputRef = useRef(null)
  const intl = useIntl()

  useEffect(() => {
    updateLinks()
  })

  function updateLinks () {
    setShareUrl(getSharingUrl())
  }

  function getSharingMessage () {
    const street = props.street
    let message = ''

    if (street.creatorId) {
      if (props.signedIn && street.creatorId === props.userId) {
        if (street.name) {
          message = intl.formatMessage(
            {
              id: 'menu.share.messages.my-street',
              defaultMessage: 'Check out my street, {streetName}, on Streetmix!'
            },
            { streetName: street.name }
          )
        } else {
          message = intl.formatMessage({
            id: 'menu.share.messages.my-street-unnamed',
            defaultMessage: 'Check out my street on Streetmix!'
          })
        }
      } else {
        if (street.name) {
          message = intl.formatMessage(
            {
              id: 'menu.share.messages.someone-elses-street',
              defaultMessage:
                'Check out {streetName} by {streetCreator} on Streetmix!'
            },
            { streetName: street.name, streetCreator: `@${street.creatorId}` }
          )
        } else {
          message = intl.formatMessage(
            {
              id: 'menu.share.messages.someone-elses-street-unnamed',
              defaultMessage:
                'Check out this street by {streetCreator} on Streetmix!'
            },
            { streetCreator: `@${street.creatorId}` }
          )
        }
      }
    } else {
      if (street.name) {
        message = intl.formatMessage(
          {
            id: 'menu.share.messages.anonymous-creator-street',
            defaultMessage: 'Check out {streetName} on Streetmix!'
          },
          { streetName: street.name }
        )
      } else {
        message = intl.formatMessage({
          id: 'menu.share.messages.anonymous-creator-street-unnamed',
          defaultMessage: 'Check out this street on Streetmix!'
        })
      }
    }

    return message
  }

  function handleShow () {
    // Make sure links are updated when the menu is opened
    updateLinks()

    // Auto-focus and select link when share menu is active
    window.setTimeout(() => {
      shareViaLinkInputRef.current.focus()
      shareViaLinkInputRef.current.select()
    }, 200)
  }

  function handleClickShareViaTwitter () {
    saveStreetThumbnail(props.street, SAVE_THUMBNAIL_EVENTS.SHARE)
    trackEvent('SHARING', 'TWITTER', null, null, false)
  }

  function handleClickShareViaFacebook () {
    saveStreetThumbnail(props.street, SAVE_THUMBNAIL_EVENTS.SHARE)
    trackEvent('SHARING', 'FACEBOOK', null, null, false)
  }

  function handleClickSaveAsImage (event) {
    event.preventDefault()
    props.showDialog('SAVE_AS_IMAGE')
  }

  function handleClickSignIn (event) {
    event.preventDefault()
    props.showDialog('SIGN_IN')
  }

  function handleClickPrint (event) {
    event.preventDefault()

    // Manually dispatch printing state here. Workaround for Chrome bug where
    // calling window.print() programatically (even with a timeout) render a
    // blank image instead
    props.startPrinting()

    window.setTimeout(function () {
      window.print()
    }, 0)
  }

  const shareText = getSharingMessage()
  const twitterLink =
    'https://twitter.com/intent/tweet' +
    '?text=' +
    encodeURIComponent(shareText) +
    '&url=' +
    encodeURIComponent(shareUrl)

  const facebookLink =
    'https://www.facebook.com/dialog/feed' +
    '?app_id=' +
    encodeURIComponent(FACEBOOK_APP_ID) +
    '&redirect_uri=' +
    encodeURIComponent(shareUrl) +
    '&link=' +
    encodeURIComponent(shareUrl) +
    '&name=' +
    encodeURIComponent(getPageTitle(props.street)) +
    '&description=' +
    encodeURIComponent(shareText)

  const signInLink = (
    <a onClick={handleClickSignIn} href="#">
      <FormattedMessage
        defaultMessage="Sign in"
        id="menu.share.sign-in-twitter-link"
      />
    </a>
  )

  const signInPromo = !props.signedIn ? (
    <div className="share-sign-in-promo">
      <FormattedMessage
        id="menu.share.sign-in-link"
        defaultMessage="{signInLink} for nicer links to your streets and your personal street gallery"
        values={{
          signInLink
        }}
      />
    </div>
  ) : null

  return (
    <Menu onShow={handleShow} className="share-menu" {...props}>
      {signInPromo}
      <div className="share-via-link-container">
        <FormattedMessage
          id="menu.share.link"
          defaultMessage="Copy and paste this link to share:"
        />
        <div className="share-via-link-form">
          <input
            className="share-via-link"
            type="text"
            value={shareUrl}
            onCopy={() => {
              saveStreetThumbnail(props.street, SAVE_THUMBNAIL_EVENTS.SHARE)
            }}
            spellCheck="false"
            ref={shareViaLinkInputRef}
            readOnly
          />
          <button
            onClick={(event) => {
              event.preventDefault()
              copy(shareUrl)
            }}
          >
            <Icon icon="copy" />
          </button>
        </div>
      </div>
      <a
        className="share-via-twitter"
        href={twitterLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClickShareViaTwitter}
      >
        <Icon icon="twitter" />
        <FormattedMessage
          id="menu.share.twitter"
          defaultMessage="Share using Twitter"
        />
      </a>
      <a
        className="share-via-facebook"
        href={facebookLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClickShareViaFacebook}
      >
        <Icon icon="facebook" />
        <FormattedMessage
          id="menu.share.facebook"
          defaultMessage="Share using Facebook"
        />
      </a>
      <a href="#" onClick={handleClickPrint}>
        <FormattedMessage id="menu.share.print" defaultMessage="Print…" />
      </a>
      <a id="save-as-image" href="#" onClick={handleClickSaveAsImage}>
        <FormattedMessage
          id="menu.share.save"
          defaultMessage="Save as image…"
        />
        <span className="menu-item-subtext">
          <FormattedMessage
            id="menu.share.save-byline"
            defaultMessage="For including in a report, blog, etc."
          />
        </span>
      </a>
    </Menu>
  )
}

const mapStateToProps = (state) => ({
  signedIn: state.user.signedIn,
  userId: (state.user.signInData && state.user.signInData.userId) || '',
  street: state.street
})

const mapDispatchToProps = {
  showDialog,
  startPrinting
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShareMenu)
