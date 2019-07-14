import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'
import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import SegmentCanvas from './SegmentCanvas'
import { TILE_SIZE } from './constants'
import { Types, paletteSegmentSource, collectDragSource } from './drag_and_drop'
import { getSegmentVariantInfo, getSegmentInfo } from './info'
import { getVariantInfoDimensions } from './view'
import { generateRandSeed } from '../util/random'
import './SegmentForPalette.scss'

const PALETTE_SEGMENT_EXTRA_PADDING = 6
const PALETTE_GROUND_BASELINE = 65
const PALETTE_SEGMENT_MULTIPLIER = 1 / 3

export class SegmentForPalette extends React.Component {
  static propTypes = {
    // Provided by react-intl
    intl: intlShape.isRequired,

    // Provided by react-dnd
    connectDragSource: PropTypes.func,
    connectDragPreview: PropTypes.func,

    // Provided by parent
    type: PropTypes.string.isRequired,
    variantString: PropTypes.string.isRequired,
    onPointerOver: PropTypes.func
  }

  componentDidMount = () => {
    this.props.connectDragPreview(getEmptyImage(), { captureDraggingState: true })
  }

  handlePointerOver = (event) => {
    const label = this.getLabel()
    const rect = event.target.getBoundingClientRect()
    this.props.onPointerOver(event, label, rect)
  }

  getInfo = () => {
    const segment = getSegmentInfo(this.props.type)
    const variant = getSegmentVariantInfo(this.props.type, this.props.variantString)

    return {
      segment,
      variant
    }
  }

  getLabel = () => {
    // Get localized display names
    const info = this.getInfo()
    const defaultMessage = info.variant.name || info.segment.name

    return this.props.intl.formatMessage({ id: `segments.${info.segment.nameKey}`, defaultMessage })
  }

  render () {
    const info = this.getInfo()

    // Determine width to render at
    const dimensions = getVariantInfoDimensions(info.variant)

    let actualWidth = dimensions.right - dimensions.left
    if (!actualWidth) {
      actualWidth = info.segment.defaultWidth
    }
    actualWidth += PALETTE_SEGMENT_EXTRA_PADDING

    return this.props.connectDragSource(
      <div
        style={{ width: (actualWidth * TILE_SIZE * PALETTE_SEGMENT_MULTIPLIER) + 'px' }}
        className="segment segment-in-palette"
        onPointerOver={this.handlePointerOver}
      >
        <SegmentCanvas
          actualWidth={actualWidth}
          type={this.props.type}
          variantString={this.props.variantString}
          randSeed={generateRandSeed()}
          multiplier={PALETTE_SEGMENT_MULTIPLIER}
          groundBaseline={PALETTE_GROUND_BASELINE}
        />
      </div>
    )
  }
}

export default DragSource(Types.PALETTE_SEGMENT, paletteSegmentSource, collectDragSource)(injectIntl(SegmentForPalette))
