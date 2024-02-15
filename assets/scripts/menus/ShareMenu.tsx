import React, { useState, useRef, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import {
  Link2Icon,
  CubeIcon,
  DownloadIcon,
  ExternalLinkIcon
} from '@radix-ui/react-icons'
import { IoPrintOutline } from 'react-icons/io5'
import copy from 'copy-to-clipboard'
import { useSelector, useDispatch } from '../store/hooks'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import ExternalLink from '../ui/ExternalLink'
import { FACEBOOK_APP_ID } from '../app/config'
import { getPageTitle } from '../app/page_title'
import { getSharingUrl } from '../util/share_url'
import { doSignIn } from '../users/authentication'
import { showDialog } from '../store/slices/dialogs'
import { startPrinting } from '../store/slices/app'
import Menu, { type MenuProps } from './Menu'
import './ShareMenu.scss'

const LS_SHARE_MASTODON = 'share:mastodon-domain'
const MASTODON_DEFAULT_DOMAIN = 'mastodon.social'

function ShareMenu (props: MenuProps): React.ReactElement {
  const offline = useSelector((state) => state.system.offline)
  const signedIn = useSelector((state) => state.user.signedIn || false)
  const userId = useSelector((state) => state.user.signInData?.userId ?? '')
  const street = useSelector((state) => state.street)
  const dispatch = useDispatch()
  const [shareUrl, setShareUrl] = useState('')
  const shareViaLinkInputRef = useRef<HTMLInputElement>(null)
  const intl = useIntl()

  useEffect(() => {
    updateLinks()
  })

  function updateLinks (): void {
    setShareUrl(getSharingUrl())
  }

  function getSharingMessage (): string {
    let message = ''

    if (typeof street.creatorId === 'string') {
      if (signedIn && street.creatorId === userId) {
        if (typeof street.name === 'string') {
          message = intl.formatMessage(
            {
              id: 'menu.share.messages.my-street',
              defaultMessage:
                'Check out my street, {streetName}, on Streetmix!'
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
        if (typeof street.name === 'string') {
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
      if (typeof street.name === 'string') {
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

  function handleShow (): void {
    // Make sure links are updated when the menu is opened
    updateLinks()

    // Auto-focus and select link when share menu is active
    window.setTimeout(() => {
      if (!shareViaLinkInputRef.current) return
      shareViaLinkInputRef.current.focus()
      shareViaLinkInputRef.current.select()
    }, 200)
  }

  function handleClickSaveAsImage (event: React.MouseEvent): void {
    event.preventDefault()
    dispatch(showDialog('SAVE_AS_IMAGE'))
  }

  function handleClickSignIn (event: React.MouseEvent): void {
    event.preventDefault()
    doSignIn()
  }

  function handleClickPrint (event: React.MouseEvent): void {
    event.preventDefault()

    // Manually dispatch printing state here. Workaround for Chrome bug where
    // calling window.print() programatically (even with a timeout) render a
    // blank image instead
    dispatch(startPrinting())

    window.setTimeout(function () {
      window.print()
    }, 0)
  }

  function handleShareToMastodon (event: React.MouseEvent): void {
    // Get the Mastodon domain. User might have specified one in localstorage,
    // so use it if specified, otherwise use the "main" Mastodon instance
    const domain = window.prompt(
      'Enter your Mastodon instance domain',
      window.localStorage.getItem(LS_SHARE_MASTODON) ?? MASTODON_DEFAULT_DOMAIN
    )

    // Remember the value for later, because a person is likely to be
    // using the same instance for every share
    try {
      if (domain !== null) {
        window.localStorage.setItem(LS_SHARE_MASTODON, domain)
      } else {
        window.localStorage.removeItem(LS_SHARE_MASTODON)
      }
    } catch (err) {
      // Catch and continue if there is an error
      console.error(`Error writing to ${LS_SHARE_MASTODON} on localStorage`)
    }

    // Bail if we don't have a domain
    if (domain === null) return

    // Build the URL
    const url =
      'https://' +
      encodeURIComponent(domain) +
      '/share?text=' +
      encodeURIComponent(getSharingMessage()) +
      '&url=' +
      encodeURIComponent(shareUrl)

    // Open a window on the share page
    window.open(url, '_blank')
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
    encodeURIComponent(FACEBOOK_APP_ID ?? '') +
    '&redirect_uri=' +
    encodeURIComponent(shareUrl) +
    '&link=' +
    encodeURIComponent(shareUrl) +
    '&name=' +
    encodeURIComponent(getPageTitle(street)) +
    '&description=' +
    encodeURIComponent(shareText)

  const signInLink = (
    <a onClick={handleClickSignIn}>
      <FormattedMessage
        defaultMessage="Sign in"
        id="menu.share.sign-in-twitter-link"
      />
    </a>
  )

  const signInPromo = !signedIn
    ? (
      <div className="share-sign-in-promo">
        <FormattedMessage
          id="menu.share.sign-in-link"
          defaultMessage="{signInLink} for nicer links to your streets and your personal street gallery"
          values={{
            signInLink
          }}
        />
      </div>
      )
    : null

  return (
    <Menu onShow={handleShow} className="share-menu" {...props}>
      {!offline && (
        <>
          {signInPromo}
          <div className="share-via-link-container">
            <Link2Icon className="menu-item-icon-radix" />
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
              <Button
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
              </Button>
            </div>
          </div>
          <a onClick={handleShareToMastodon}>
            <Icon icon="mastodon" className="menu-item-icon" />
            <FormattedMessage
              id="menu.share.mastodon"
              defaultMessage="Share using Mastodon"
            />
            <ExternalLinkIcon className="menu-item-external-link" />
          </a>
          <ExternalLink href={twitterLink}>
            <Icon icon="twitter" className="menu-item-icon" />
            <FormattedMessage
              id="menu.share.twitter"
              defaultMessage="Share using Twitter"
            />
            <ExternalLinkIcon className="menu-item-external-link" />
          </ExternalLink>
          <ExternalLink href={facebookLink}>
            <Icon icon="facebook" className="menu-item-icon" />
            <FormattedMessage
              id="menu.share.facebook"
              defaultMessage="Share using Facebook"
            />
            <ExternalLinkIcon className="menu-item-external-link" />
          </ExternalLink>
          <ExternalLink href={`https://3dstreet.app/#${window.location.href}`}>
            <CubeIcon className="menu-item-icon-radix" />
            <FormattedMessage
              id="menu.share.3dstreet"
              defaultMessage="Open in 3DStreet"
            />
            <ExternalLinkIcon className="menu-item-external-link" />
          </ExternalLink>
        </>
      )}
      <a onClick={handleClickPrint}>
        <IoPrintOutline className="menu-item-icon" />
        <FormattedMessage id="menu.share.print" defaultMessage="Print…" />
      </a>
      <a id="save-as-image" onClick={handleClickSaveAsImage}>
        <DownloadIcon className="menu-item-icon-radix" />
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
