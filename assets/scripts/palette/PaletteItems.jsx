/**
 * The Palette is the UI element at the bottom of the screen that shows all the
 * available street segments. Users can drag and drop segments from the palette
 * onto the street.
 */
import React, { useRef, useEffect } from 'react'
import { IntlProvider } from 'react-intl'
import { useSelector } from 'react-redux'
import Scrollable from '../ui/Scrollable'
import Tooltip, { useSingleton } from '../ui/Tooltip'
import SegmentForPalette from '../segments/SegmentForPalette'
import { getAllSegmentInfoArray } from '../segments/info'
import { generateRandSeed } from '../util/random'
import './PaletteItems.scss'

function PaletteItems (props) {
  const flags = useSelector((state) => state.flags)
  const locale = useSelector((state) => state.locale)
  const [source, target] = useSingleton()
  const scrollable = useRef()

  // `randSeed` is stored as a ref so that its value does not change
  // on every re-render
  const randSeed = useRef(generateRandSeed())

  useEffect(() => {
    if (scrollable.current) {
      window.setTimeout(scrollable.current.checkButtonVisibilityState, 0)
    }
  }, [])

  const segments = getAllSegmentInfoArray()

  // For each segment, filter out the ones that have been disabled
  // by feature flag
  const displayedSegments = segments
    .filter(
      (segment) =>
        !segment.enableWithFlag ||
        (segment.enableWithFlag && flags[segment.enableWithFlag]?.value)
    )
    .map((segment) => (
      <SegmentForPalette
        key={segment.id}
        segment={segment}
        unlockCondition={segment.unlockCondition}
        randSeed={randSeed.current}
        tooltipTarget={target}
      />
    ))

  return (
    <>
      <Tooltip source={source} />
      <Scrollable className="palette-items" ref={scrollable}>
        <IntlProvider locale={locale.locale} messages={locale.segmentInfo}>
          <ul>{displayedSegments}</ul>
        </IntlProvider>
      </Scrollable>
    </>
  )
}

export default React.memo(PaletteItems)
