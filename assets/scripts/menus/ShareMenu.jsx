import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import copy from 'copy-to-clipboard'
import Menu from './Menu'
import Icon from '../ui/Icon'
import ExternalLink from '../ui/ExternalLink'
import { FACEBOOK_APP_ID } from '../app/config'
import { getPageTitle } from '../app/page_title'
import { getSharingUrl } from '../util/share_url'
import { showDialog } from '../store/slices/dialogs'
import { startPrinting } from '../store/slices/app'
import './ShareMenu.scss'

function ShareMenu (props) {
  const noInternet = useSelector((state) => state.system.noInternet)
  const signedIn = useSelector((state) => state.user.signedIn || false)
  const userId = useSelector((state) => state.user.signInData?.userId || '')
  const street = useSelector((state) => state.street)
  const dispatch = useDispatch()
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
    let message = ''

    if (street.creatorId) {
      if (signedIn && street.creatorId === userId) {
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

  function handleClickSaveAsImage (event) {
    event.preventDefault()
    dispatch(showDialog('SAVE_AS_IMAGE'))
  }

  function handleClickSignIn (event) {
    event.preventDefault()
    dispatch(showDialog('SIGN_IN'))
  }

  function handleClickPrint (event) {
    event.preventDefault()

    // Manually dispatch printing state here. Workaround for Chrome bug where
    // calling window.print() programatically (even with a timeout) render a
    // blank image instead
    dispatch(startPrinting())

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
    encodeURIComponent(getPageTitle(street)) +
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

  const signInPromo = !signedIn ? (
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
      {!noInternet && (
        <>
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
                spellCheck="false"
                ref={shareViaLinkInputRef}
                readOnly={true}
              />
              <button
                title={intl.formatMessage({
                  id: 'menu.share.copy-to-clipboard',
                  defaultMessage: 'Copy to clipboard'
                })}
                onClick={(event) => {
                  event.preventDefault()
                  copy(shareUrl)
                }}
              >
                <Icon icon="copy" />
              </button>
            </div>
          </div>
          <ExternalLink className="share-via-twitter" href={twitterLink}>
            <Icon icon="twitter" />
            <FormattedMessage
              id="menu.share.twitter"
              defaultMessage="Share using Twitter"
            />
          </ExternalLink>
          <ExternalLink className="share-via-facebook" href={facebookLink}>
            <Icon icon="facebook" />
            <FormattedMessage
              id="menu.share.facebook"
              defaultMessage="Share using Facebook"
            />
          </ExternalLink>
        </>
      )}
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

export default ShareMenu
