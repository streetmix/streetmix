import { FormattedMessage } from 'react-intl'

import Icon from '~/src/ui/Icon.js'
import { MenuItem } from '../MenuItem.js'

export function Export3DStreet() {
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
