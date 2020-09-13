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
import SegmentCanvas from './SegmentCanvas'
import { TILE_SIZE } from './constants'
import { Types, paletteSegmentSource, collectDragSource } from './drag_and_drop'
import { getSegmentVariantInfo, getSegmentInfo } from './info'
import { getVariantInfoDimensions } from './view'
import Tooltip from '../ui/Tooltip'
import { ICON_LOCK } from '../ui/icons'
import './SegmentForPalette.scss'

const PALETTE_SEGMENT_EXTRA_PADDING = 6
const PALETTE_GROUND_BASELINE = 65
const PALETTE_SEGMENT_MULTIPLIER = 1 / 3
const ICON_MULTIPLIER = 1 / 2

SegmentForPalette.propTypes = {
  // Provided by react-dnd
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,
  isIcon: PropTypes.bool,

  // Provided by parent
  type: PropTypes.string.isRequired,
  variantString: PropTypes.string.isRequired,
  onPointerOver: PropTypes.func,
  randSeed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  disabled: PropTypes.bool,
  tooltipTarget: PropTypes.object
}

function SegmentForPalette (props) {
  const intl = useIntl()

  props.connectDragPreview(getEmptyImage(), { captureDraggingState: true })

  function getLabel (props) {
    // Get localized display names
    const segment = getSegmentInfo(props.type)
    const defaultMessage = segment.name

    return intl.formatMessage({
      id: `segments.${segment.nameKey}`,
      defaultMessage
    })
  }

  const segment = getSegmentInfo(props.type)
  const variant = getSegmentVariantInfo(props.type, props.variantString)

  // Determine width to render at
  const dimensions = getVariantInfoDimensions(variant)

  let actualWidth = dimensions.right - dimensions.left
  if (!actualWidth) {
    actualWidth = segment.defaultWidth
  }
  actualWidth += PALETTE_SEGMENT_EXTRA_PADDING

  if (props.isIcon) {
    return (
      <div
        style={{
          width: actualWidth * TILE_SIZE * PALETTE_SEGMENT_MULTIPLIER + 'px'
        }}
        className="segment segment-icon"
        data-testid="segment-icon"
      >
        <SegmentCanvas
          actualWidth={actualWidth}
          type={props.type}
          isIcon={props.isIcon}
          variantString={props.variantString}
          randSeed={props.randSeed}
          multiplier={
            props.isIcon ? ICON_MULTIPLIER : PALETTE_SEGMENT_MULTIPLIER
          }
          groundBaseline={PALETTE_GROUND_BASELINE}
        />
      </div>
    )
  }

  if (props.disabled) {
    return (
      <div
        style={{
          width: actualWidth * TILE_SIZE * PALETTE_SEGMENT_MULTIPLIER + 'px'
        }}
        className="segment segment-in-palette segment-disabled"
        data-testid="segment-for-palette"
      >
        <Tooltip
          target={props.tooltipTarget}
          label={getLabel(props)}
          sublabel={intl.formatMessage({
            id: 'plus.locked.user',
            // Default message ends with a Unicode-only left-right order mark
            // to allow for proper punctuation in `rtl` text direction
            // This character is hidden from editors by default!
            defaultMessage: 'Sign in to use!‎'
          })}
        >
          {/* Wrapper element necessary for <Tooltip /> (alternate solution is
              to forward ref) */}
          <div style={{ height: '80px' }}>
            <SegmentCanvas
              actualWidth={actualWidth}
              type={props.type}
              variantString={props.variantString}
              randSeed={props.randSeed}
              multiplier={PALETTE_SEGMENT_MULTIPLIER}
              groundBaseline={PALETTE_GROUND_BASELINE}
            />
          </div>
        </Tooltip>
        <FontAwesomeIcon icon={ICON_LOCK} />
      </div>
    )
  }

  return props.connectDragSource(
    <div
      style={{
        width: actualWidth * TILE_SIZE * PALETTE_SEGMENT_MULTIPLIER + 'px'
      }}
      className="segment segment-in-palette"
      data-testid="segment-for-palette"
    >
      <Tooltip target={props.tooltipTarget} label={getLabel(props)}>
        {/* Wrapper element necessary for <Tooltip /> (alternate solution is
            to forward ref) */}
        <div style={{ height: '80px' }}>
          <SegmentCanvas
            actualWidth={actualWidth}
            type={props.type}
            variantString={props.variantString}
            randSeed={props.randSeed}
            multiplier={PALETTE_SEGMENT_MULTIPLIER}
            groundBaseline={PALETTE_GROUND_BASELINE}
          />
        </div>
      </Tooltip>
    </div>
  )
}

export default DragSource(
  Types.PALETTE_SEGMENT,
  paletteSegmentSource,
  collectDragSource
)(SegmentForPalette)
