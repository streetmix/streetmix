import React from 'react'
import PropTypes from 'prop-types'
import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import SegmentCanvas from './SegmentCanvas'
import { Types, segmentSource, collectDragSource } from './drag_and_drop'
import { getSegmentVariantInfo, getSegmentInfo } from './info'
import { t } from '../locales/locale'

class SegmentForPalette extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    variantString: PropTypes.string.isRequired,
    width: PropTypes.number,
    randSeed: PropTypes.number,
    connectDragSource: PropTypes.func,
    connectDragPreview: PropTypes.func
  }

  componentDidMount = () => {
    this.props.connectDragPreview(getEmptyImage(), { captureDraggingState: true })
  }

  render () {
    // Get localized display names
    // TODO: port to react-intl/formatMessage later.
    const segmentInfo = getSegmentInfo(this.props.type)
    const variantInfo = getSegmentVariantInfo(this.props.type, this.props.variantString)
    const defaultName = variantInfo.name || segmentInfo.name
    const localizedSegmentName = t(`segments.${segmentInfo.nameKey}`, defaultName, { ns: 'segment-info' })

    return this.props.connectDragSource(
      <div
        style={{ width: this.props.width + 'px' }}
        className="segment segment-in-palette"
        title={localizedSegmentName}
      >
        <SegmentCanvas
          width={this.props.width}
          type={this.props.type}
          variantString={this.props.variantString}
          randSeed={this.props.randSeed}
          forPalette
        />
      </div>
    )
  }
}

export default DragSource(Types.PALETTE_SEGMENT, segmentSource, collectDragSource)(SegmentForPalette)
