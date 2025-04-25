/**
 * The Palette is the UI element at the bottom of the screen that shows all the
 * available street segments. Users can drag and drop segments from the palette
 * onto the street.
 */
import React from 'react'
import { IntlProvider } from 'react-intl'

import { useSelector } from '../store/hooks'
import Scrollable from '../ui/Scrollable'
import Tooltip, { useSingleton } from '../ui/TooltipLegacy'
import { getAllSegmentInfo } from '../segments/info'
import PaletteItem from './PaletteItem'
import './PaletteItems.css'

function PaletteItems (): React.ReactElement {
  const flags = useSelector((state) => state.flags)
  const locale = useSelector((state) => state.locale)
  const [source, target] = useSingleton()

  const segments = getAllSegmentInfo()

  // For each segment, filter out the ones that have been disabled
  // by feature flag
  const displayedSegments = segments
    .filter(
      (segment) =>
        segment.enableWithFlag === undefined ||
        (segment.enableWithFlag !== undefined &&
          flags[segment.enableWithFlag]?.value)
    )
    .map((segment) => (
      <PaletteItem key={segment.id} segment={segment} tooltipTarget={target} />
    ))

  return (
    <>
      <Tooltip source={source} />
      <Scrollable className="palette-items">
        <IntlProvider locale={locale.locale} messages={locale.segmentInfo}>
          <ul>{displayedSegments}</ul>
        </IntlProvider>
      </Scrollable>
    </>
  )
}

export default PaletteItems
