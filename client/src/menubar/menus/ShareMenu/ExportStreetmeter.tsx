import { BetaTag } from '~/src/ui/BetaTag.js'
import { Icon } from '~/src/ui/Icon.js'
import { MenuItem } from '../MenuItem.js'

export function ExportStreetmeter() {
  return (
    <MenuItem href={`https://streetmeter.net/#${window.location.href}`}>
      <Icon name="chart" className="menu-item-icon" />
      Open in Streetmeter <BetaTag />
    </MenuItem>
  )
}
