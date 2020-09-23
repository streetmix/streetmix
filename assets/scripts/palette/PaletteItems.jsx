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

  // `randSeed` is stored as a ref so that its value does not change on every re-render
  const randSeed = useRef(generateRandSeed())

  useEffect(() => {
    if (scrollable.current) {
      window.setTimeout(scrollable.current.checkButtonVisibilityState, 0)
    }
  }, [])

  const segments = getAllSegmentInfoArray()

  // For each segment, set "disabled" property instead that indicates
  // whether this segment is in a disabled state for this user
  // Then filter out disabled segments that do not have the
  // `alwaysShowInPalette` property set to `true`
  const displayedSegments = segments
    .map((segment) => {
      // Accept segments that don't have the `enableWithFlag` property
      const enabledByDefault = !segment.enableWithFlag
      // Accept segments with the `enableWithFlag` property, but only if
      // the flags have that value set to true.
      const enabledByFlag =
        (segment.enableWithFlag && flags[segment.enableWithFlag]?.value) ||
        false

      return {
        ...segment,
        disabled: !(enabledByDefault || enabledByFlag)
      }
    })
    .filter(
      (segment) =>
        !segment.disabled || (segment.disabled && segment.alwaysShowInPalette)
    )
    .map((segment) => (
      <SegmentForPalette
        key={segment.id}
        type={segment.id}
        variantString={
          segment.paletteIcon
            ? segment.paletteIcon
            : Object.keys(segment.details).shift()
        }
        randSeed={randSeed.current}
        disabled={segment.disabled}
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
