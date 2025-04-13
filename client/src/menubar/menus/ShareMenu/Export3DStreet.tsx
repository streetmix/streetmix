import React from 'react'
import { FormattedMessage } from 'react-intl'

import Icon from '~/src/ui/Icon'
import MenuItem from '../MenuItem'

function Export3DStreet (): React.ReactElement {
  return (
    <MenuItem href={`https://3dstreet.app/#${window.location.href}`}>
      <Icon name="cube" className="menu-item-icon" />
      <FormattedMessage
        id="menu.share.3dstreet"
        defaultMessage="Open in 3DStreet"
      />
    </MenuItem>
  )
}

export default Export3DStreet
