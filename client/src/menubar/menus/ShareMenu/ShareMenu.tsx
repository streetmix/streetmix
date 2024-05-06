import React, { useRef } from 'react'
import { useIntl } from 'react-intl'

import { useSelector } from '~/src/store/hooks'
import Menu, { type MenuProps } from '../Menu'
import CopyShareLink from './CopyShareLink'
import Export3DStreet from './Export3DStreet'
import ExportStreetmeter from './ExportStreetmeter'
import PostOnFacebook from './PostOnFacebook'
import PostOnMastodon from './PostOnMastodon'
import PostOnTwitter from './PostOnTwitter'
import PrintImage from './PrintImage'
import SaveImage from './SaveImage'
import SignInPromo from './SignInPromo'
import { getSharingUrl, getSharingMessage } from './helpers'
import './ShareMenu.scss'

function ShareMenu (props: MenuProps): React.ReactElement {
  const offline = useSelector((state) => state.system.offline)
  const user = useSelector((state) => state.user)
  const street = useSelector((state) => state.street)
  const flag = useSelector((state) => state.flags.STREETMETER_EXPORT.value)
  const copyShareLinkRef = useRef<HTMLInputElement>(null)
  const intl = useIntl()

  function handleShow (): void {
    // Auto-focus and select link when share menu is active
    window.setTimeout(() => {
      if (!copyShareLinkRef.current) return
      copyShareLinkRef.current.focus()
      copyShareLinkRef.current.select()
    }, 200)
  }

  const shareText = getSharingMessage(street, user, intl)
  const shareUrl = getSharingUrl()

  return (
    <Menu onShow={handleShow} className="share-menu" {...props}>
      {!offline && (
        <>
          {!user.signedIn && <SignInPromo />}
          <CopyShareLink shareUrl={shareUrl} ref={copyShareLinkRef} />
          <PostOnMastodon shareText={shareText} shareUrl={shareUrl} />
          <PostOnTwitter shareText={shareText} shareUrl={shareUrl} />
          <PostOnFacebook shareText={shareText} shareUrl={shareUrl} />
          <Export3DStreet />
          {flag && <ExportStreetmeter />}
        </>
      )}
      <PrintImage />
      <SaveImage />
    </Menu>
  )
}

export default ShareMenu
