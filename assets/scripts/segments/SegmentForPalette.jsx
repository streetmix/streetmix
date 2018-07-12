import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'
import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import SegmentCanvas from './SegmentCanvas'
import { Types, paletteSegmentSource, collectDragSource } from './drag_and_drop'
import { getSegmentVariantInfo, getSegmentInfo } from './info'
import { generateRandSeed } from '../util/random'

class SegmentForPalette extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    type: PropTypes.string.isRequired,
    variantString: PropTypes.string.isRequired,
    width: PropTypes.number,
    connectDragSource: PropTypes.func,
    connectDragPreview: PropTypes.func
  }

  componentDidMount = () => {
    this.props.connectDragPreview(getEmptyImage(), { captureDraggingState: true })
  }

  render () {
    // Get localized display names
    const segmentInfo = getSegmentInfo(this.props.type)
    const variantInfo = getSegmentVariantInfo(this.props.type, this.props.variantString)
    const defaultMessage = variantInfo.name || segmentInfo.name

    return this.props.connectDragSource(
      <div
        style={{ width: this.props.width + 'px' }}
        className="segment segment-in-palette"
        title={this.props.intl.formatMessage({ id: `segments.${segmentInfo.nameKey}`, defaultMessage })}
      >
        <SegmentCanvas
          width={this.props.width}
          type={this.props.type}
          variantString={this.props.variantString}
          randSeed={generateRandSeed()}
          forPalette
        />
      </div>
    )
  }
}

export default DragSource(Types.PALETTE_SEGMENT, paletteSegmentSource, collectDragSource)(injectIntl(SegmentForPalette))
