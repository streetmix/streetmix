/**
 * The Palette is the UI element at the bottom of the screen that shows all the
 * available street segments. Users can drag and drop segments from the palette
 * onto the street.
 */
import { IntlProvider } from 'react-intl'
import { getAllSegmentInfo } from '@streetmix/parts'

import { useSelector } from '../store/hooks.js'
import { Scrollable } from '../ui/Scrollable.js'
import { TooltipGroup } from '../ui/Tooltip.js'
import { PaletteItem } from './PaletteItem.js'
import './PaletteItems.css'

export function PaletteItems() {
  const flags = useSelector((state) => state.flags)
  const locale = useSelector((state) => state.locale)

  const elements = getAllSegmentInfo()

  // For each element, filter out the ones that have been disabled
  // by feature flag
  const displayedElements = elements
    .filter(
      (e) =>
        e.enableWithFlag === undefined ||
        (e.enableWithFlag !== undefined && flags[e.enableWithFlag]?.value)
    )
    .map((e) => <PaletteItem key={e.id} element={e} />)

  return (
    <TooltipGroup>
      <Scrollable className="palette-items">
        <IntlProvider locale={locale.locale} messages={locale.segmentInfo}>
          <ul>{displayedElements}</ul>
        </IntlProvider>
      </Scrollable>
    </TooltipGroup>
  )
}
