import React, { useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import {
  Link2Icon,
  CubeIcon,
  DownloadIcon,
  ExternalLinkIcon
} from '@radix-ui/react-icons'
import { IoPrintOutline } from 'react-icons/io5'
import copy from 'copy-to-clipboard'

import { useSelector, useDispatch } from '~/src/store/hooks'
import Button from '~/src/ui/Button'
import Icon from '~/src/ui/Icon'
import ExternalLink from '~/src/ui/ExternalLink'
import { FACEBOOK_APP_ID } from '~/src/app/config'
import { getPageTitle } from '~/src/app/page_title'
import { doSignIn } from '~/src/users/authentication'
import { showDialog } from '~/src/store/slices/dialogs'
import { startPrinting } from '~/src/store/slices/app'
import Menu, { type MenuProps } from '../Menu'
import { getSharingUrl, getSharingMessage } from './helpers'
import './ShareMenu.scss'

const LS_SHARE_MASTODON = 'share:mastodon-domain'
const MASTODON_DEFAULT_DOMAIN = 'mastodon.social'

function ShareMenu (props: MenuProps): React.ReactElement {
  const offline = useSelector((state) => state.system.offline)
  const user = useSelector((state) => state.user)
  const street = useSelector((state) => state.street)
  const flag = useSelector((state) => state.flags.STREETMETER_EXPORT.value)
  const dispatch = useDispatch()
  const shareViaLinkInputRef = useRef<HTMLInputElement>(null)
  const intl = useIntl()

  function handleShow (): void {
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
      encodeURIComponent(getSharingMessage(street, user, intl)) +
      '&url=' +
      encodeURIComponent(shareUrl)

    // Open a window on the share page
    window.open(url, '_blank')
  }

  const shareText = getSharingMessage(street, user, intl)
  const shareUrl = getSharingUrl()

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

  const signInPromo = !user.signedIn
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
          {flag && (
            <ExternalLink
              href={`https://streetmeter.net/#${window.location.href}`}
            >
              Open in Streetmeter
              <span
                style={{
                  backgroundColor: '#ffd755',
                  color: '#554100',
                  borderRadius: '4px',
                  marginLeft: '.5em',
                  padding: '.25em .5em',
                  fontSize: '.85em',
                  fontWeight: '550'
                }}
              >
                BETA
              </span>
              <ExternalLinkIcon className="menu-item-external-link" />
            </ExternalLink>
          )}
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
