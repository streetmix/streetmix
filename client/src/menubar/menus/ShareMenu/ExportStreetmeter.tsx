import React from 'react'

import MenuItem from '../MenuItem'
import BetaTag from '../BetaTag'

function ExportStreetmeter (): React.ReactElement {
  return (
    <MenuItem href={`https://streetmeter.net/#${window.location.href}`}>
      Open in Streetmeter <BetaTag />
    </MenuItem>
  )
}

export default ExportStreetmeter
