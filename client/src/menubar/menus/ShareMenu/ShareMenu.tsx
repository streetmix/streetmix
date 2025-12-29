import { useRef } from 'react'
import { useIntl } from 'react-intl'

import { useSelector } from '~/src/store/hooks.js'
import Menu, { type MenuProps } from '../Menu.js'
import MenuSeparator from '../MenuSeparator.js'
import CopyShareLink from './CopyShareLink.js'
import { Export3DStreet } from './Export3DStreet.js'
import { ExportStreetmeter } from './ExportStreetmeter.js'
import PostOnFacebook from './PostOnFacebook.js'
import PostOnMastodon from './PostOnMastodon.js'
import PostOnTwitter from './PostOnTwitter.js'
import PrintImage from './PrintImage.js'
import SaveImage from './SaveImage.js'
import SignInPromo from './SignInPromo.js'
import { getSharingUrl, getSharingMessage } from './helpers.js'
import './ShareMenu.css'

export function ShareMenu(props: MenuProps) {
  const offline = useSelector((state) => state.system.offline)
  const user = useSelector((state) => state.user)
  const street = useSelector((state) => state.street)
  const copyShareLinkRef = useRef<HTMLInputElement>(null)
  const intl = useIntl()

  function handleShow(): void {
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
          <MenuSeparator />
          <PostOnMastodon shareText={shareText} shareUrl={shareUrl} />
          <PostOnTwitter shareText={shareText} shareUrl={shareUrl} />
          <PostOnFacebook shareText={shareText} shareUrl={shareUrl} />
          <MenuSeparator />
          <Export3DStreet />
          <ExportStreetmeter />
          <MenuSeparator />
        </>
      )}
      <PrintImage />
      <SaveImage />
    </Menu>
  )
}
