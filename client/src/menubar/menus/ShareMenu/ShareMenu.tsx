import React, { useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link2Icon, CubeIcon, ExternalLinkIcon } from '@radix-ui/react-icons'
import { IoPrintOutline } from 'react-icons/io5'
import copy from 'copy-to-clipboard'

import { useSelector, useDispatch } from '~/src/store/hooks'
import Button from '~/src/ui/Button'
import Icon from '~/src/ui/Icon'
import ExternalLink from '~/src/ui/ExternalLink'
import { doSignIn } from '~/src/users/authentication'
import { startPrinting } from '~/src/store/slices/app'
import Menu, { type MenuProps } from '../Menu'
import PostOnFacebook from './PostOnFacebook'
import PostOnMastodon from './PostOnMastodon'
import PostOnTwitter from './PostOnTwitter'
import SaveImage from './SaveImage'
import { getSharingUrl, getSharingMessage } from './helpers'
import './ShareMenu.scss'

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

  const shareText = getSharingMessage(street, user, intl)
  const shareUrl = getSharingUrl()

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
          <PostOnMastodon shareText={shareText} shareUrl={shareUrl} />
          <PostOnTwitter shareText={shareText} shareUrl={shareUrl} />
          <PostOnFacebook shareText={shareText} shareUrl={shareUrl} />
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
      <SaveImage />
    </Menu>
  )
}

export default ShareMenu
