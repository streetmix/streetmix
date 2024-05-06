import React from 'react'
import { FormattedMessage } from 'react-intl'
import { CubeIcon, ExternalLinkIcon } from '@radix-ui/react-icons'

import ExternalLink from '~/src/ui/ExternalLink'

function Export3DStreet (): React.ReactElement {
  return (
    <ExternalLink href={`https://3dstreet.app/#${window.location.href}`}>
      <CubeIcon className="menu-item-icon-radix" />
      <FormattedMessage
        id="menu.share.3dstreet"
        defaultMessage="Open in 3DStreet"
      />
      <ExternalLinkIcon className="menu-item-external-link" />
    </ExternalLink>
  )
}

export default Export3DStreet
