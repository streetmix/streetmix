import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import SegmentCanvas from './SegmentCanvas'
import { TILE_SIZE } from './constants'
import { Types, paletteSegmentSource, collectDragSource } from './drag_and_drop'
import { getSegmentVariantInfo, getSegmentInfo } from './info'
import { getVariantInfoDimensions } from './view'
import './SegmentForPalette.scss'

const PALETTE_SEGMENT_EXTRA_PADDING = 6
const PALETTE_GROUND_BASELINE = 65
const PALETTE_SEGMENT_MULTIPLIER = 1 / 3

const SegmentForPalette = (props) => {
  const intl = useIntl()

  props.connectDragPreview(getEmptyImage(), { captureDraggingState: true })

  function getLabel (props) {
    // Get localized display names
    const segment = getSegmentInfo(props.type)
    const defaultMessage = segment.name

    return intl.formatMessage({ id: `segments.${segment.nameKey}`, defaultMessage })
  }

  function handlePointerOver (event) {
    const label = getLabel(props)
    const rect = event.target.getBoundingClientRect()
    props.onPointerOver(event, label, rect)
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

  return props.connectDragSource(
    <div
      style={{ width: (actualWidth * TILE_SIZE * PALETTE_SEGMENT_MULTIPLIER) + 'px' }}
      className="segment segment-in-palette"
      onPointerOver={handlePointerOver}
      data-testid="segment-for-palette"
    >
      <SegmentCanvas
        actualWidth={actualWidth}
        type={props.type}
        variantString={props.variantString}
        randSeed={props.randSeed}
        multiplier={PALETTE_SEGMENT_MULTIPLIER}
        groundBaseline={PALETTE_GROUND_BASELINE}
      />
    </div>
  )
}

SegmentForPalette.propTypes = {
  // Provided by react-dnd
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,

  // Provided by parent
  type: PropTypes.string.isRequired,
  variantString: PropTypes.string.isRequired,
  onPointerOver: PropTypes.func,
  randSeed: PropTypes.number
}

export default DragSource(Types.PALETTE_SEGMENT, paletteSegmentSource, collectDragSource)(SegmentForPalette)
