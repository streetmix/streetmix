import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { IntlProvider } from 'react-intl'
import { useSelector } from 'react-redux'
import Scrollable from '../ui/Scrollable'
import SegmentForPalette from '../segments/SegmentForPalette'
import { getAllSegmentInfoArray } from '../segments/info'
import { generateRandSeed } from '../util/random'
import './Palette.scss'

Palette.propTypes = {
  handlePointerOver: PropTypes.func.isRequired,
  handlePointerOut: PropTypes.func.isRequired,
  handleScroll: PropTypes.func.isRequired
}

function Palette (props) {
  const flags = useSelector((state) => state.flags)
  const locale = useSelector((state) => state.locale)
  const scrollable = useRef()

  // `randSeed` is stored as a ref so that its value does not change on every re-render
  const randSeed = useRef(generateRandSeed())

  useEffect(() => {
    if (scrollable.current) {
      window.setTimeout(scrollable.current.checkButtonVisibilityState, 0)
    }
  }, [])

  function renderPaletteItems () {
    const segments = getAllSegmentInfoArray()

    // Filter out segments that are not enabled.
    const enabledSegments = segments.filter((segment) => {
      // Accept segments that don't have the `enableWithFlag` property
      const enabledByDefault = !segment.enableWithFlag
      // Accept segments with the `enableWithFlag` property, but only if
      // the flags have that value set to true.
      const enabledByFlag =
        segment.enableWithFlag && flags[segment.enableWithFlag].value

      return enabledByDefault || enabledByFlag
    })

    // Return all enabled segments as an array of SegmentForPalette components.
    return enabledSegments.map((segment) => {
      const variant = segment.paletteIcon
        ? segment.paletteIcon
        : Object.keys(segment.details).shift()

      return (
        <SegmentForPalette
          key={segment.id}
          type={segment.id}
          variantString={variant}
          onPointerOver={props.handlePointerOver}
          randSeed={randSeed.current}
        />
      )
    })
  }

  return (
    <div onPointerOut={props.handlePointerOut}>
      <Scrollable
        className="palette"
        ref={scrollable}
        onScroll={props.handleScroll}
      >
        <IntlProvider locale={locale.locale} messages={locale.segmentInfo}>
          <>{renderPaletteItems()}</>
        </IntlProvider>
      </Scrollable>
    </div>
  )
}

export default React.memo(Palette)
