import React from 'react'

import Icon from '~/src/ui/Icon'
import MenuItem from '../MenuItem'
import BetaTag from '../BetaTag'

function ExportStreetmeter (): React.ReactElement {
  return (
    <MenuItem href={`https://streetmeter.net/#${window.location.href}`}>
      <Icon name="graph" className="menu-item-icon" />
      Open in Streetmeter <BetaTag />
    </MenuItem>
  )
}

export default ExportStreetmeter
