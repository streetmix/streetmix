import React from 'react'
import { FormattedMessage } from 'react-intl'

import ExternalLink from '~/src/ui/ExternalLink'
import Icon from '~/src/ui/Icon'

function Export3DStreet (): React.ReactElement {
  return (
    <ExternalLink
      href={`https://3dstreet.app/#${window.location.href}`}
      icon={true}
    >
      <Icon name="cube" className="menu-item-icon" />
      <FormattedMessage
        id="menu.share.3dstreet"
        defaultMessage="Open in 3DStreet"
      />
    </ExternalLink>
  )
}

export default Export3DStreet
