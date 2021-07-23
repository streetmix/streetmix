/**
 * Segments in the Palette component render differently (and have differen
 * logic and behavior) to segments rendered on the street.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { images } from '../app/load_resources'
import Tooltip from '../ui/Tooltip'
import { ICON_LOCK } from '../ui/icons'
import SegmentCanvas from './SegmentCanvas'
import { TILE_SIZE } from './constants'
import { Types, paletteSegmentSource, collectDragSource } from './drag_and_drop'
import { getSegmentVariantInfo } from './info'
import { getVariantInfoDimensions } from './view'
import './SegmentForPalette.scss'

const PALETTE_SEGMENT_EXTRA_PADDING = 5
const PALETTE_GROUND_BASELINE = 65
const PALETTE_SEGMENT_MULTIPLIER = 1 / 3

SegmentForPalette.propTypes = {
  // Provided by react-dnd
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,

  // Provided by parent
  segment: PropTypes.object,
  disabled: PropTypes.bool,
  randSeed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  tooltipTarget: PropTypes.object
}

function SegmentForPalette ({
  segment,
  disabled,
  randSeed,
  tooltipTarget,
  ...props
}) {
  const intl = useIntl()

  props.connectDragPreview(getEmptyImage(), { captureDraggingState: true })

  // Get localized display names
  function getLabel (segment) {
    const defaultMessage = segment.name

    return intl.formatMessage({
      id: `segments.${segment.nameKey}`,
      defaultMessage
    })
  }

  const classNames = ['segment', 'segment-in-palette']
  let sublabel = null

  if (disabled) {
    classNames.push('segment-disabled')
    sublabel = intl.formatMessage({
      id: 'plus.locked.user',
      // Default message ends with a Unicode-only left-right order mark
      // to allow for proper punctuation in `rtl` text direction
      // This character is hidden from editors by default!
      defaultMessage: 'Sign in to use!‎'
    })
  }

  let node
  if (segment.paletteThumbnail) {
    node = (
      <li className={classNames.join(' ')}>
        <Tooltip
          target={tooltipTarget}
          label={getLabel(segment)}
          sublabel={sublabel}
        >
          {/* Wrapper element necessary for <Tooltip />
              (alternate solution is to forward ref)
              This wrapper element is also the target for hover / focus
              in order the activate the tooltip. */}
          <div tabIndex="0">
            <img
              className="segment-image"
              src={images.get(segment.paletteThumbnail).src}
            />
          </div>
        </Tooltip>
        {disabled && <FontAwesomeIcon icon={ICON_LOCK} />}
      </li>
    )
  } else {
    const variantString = segment.paletteIcon
      ? segment.paletteIcon
      : Object.keys(segment.details).shift()
    const variant = getSegmentVariantInfo(segment.id, variantString)

    // Determine width to render at
    const dimensions = getVariantInfoDimensions(variant)

    const actualWidth =
      segment.paletteDefaultWidth ||
      segment.defaultWidth ||
      dimensions.right - dimensions.left
    const iconWidth = actualWidth + PALETTE_SEGMENT_EXTRA_PADDING

    node = (
      <li
        style={{
          width: iconWidth * TILE_SIZE * PALETTE_SEGMENT_MULTIPLIER + 'px'
        }}
        className={classNames.join(' ')}
      >
        <Tooltip
          target={tooltipTarget}
          label={getLabel(segment)}
          sublabel={sublabel}
        >
          {/* Wrapper element necessary for <Tooltip />
              (alternate solution is to forward ref)
              This wrapper element is also the target for hover / focus
              in order the activate the tooltip. */}
          <div tabIndex="0">
            <SegmentCanvas
              actualWidth={iconWidth}
              type={segment.id}
              variantString={variantString}
              randSeed={randSeed}
              multiplier={PALETTE_SEGMENT_MULTIPLIER}
              groundBaseline={PALETTE_GROUND_BASELINE}
            />
          </div>
        </Tooltip>
        {disabled && <FontAwesomeIcon icon={ICON_LOCK} />}
      </li>
    )
  }

  // If disabled, return node only
  if (disabled) {
    return node
  }

  // Otherwise, return node wrapped with react-dnd abilities.
  return props.connectDragSource(node)
}

export default DragSource(
  Types.PALETTE_SEGMENT,
  paletteSegmentSource,
  collectDragSource
)(SegmentForPalette)
