import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Segment from '../segments/Segment'

import { TILE_SIZE } from '../segments/constants'
import { getVariantArray } from '../segments/variant_utils'
import { generateRandSeed } from '../util/random'

class StreetEditable extends React.Component {
  static propTypes = {
    onResized: PropTypes.bool.isRequired,
    setBuildingWidth: PropTypes.func.isRequired,
    street: PropTypes.object.isRequired,
    calculatePerspective: PropTypes.func.isRequired
  }

  componentDidUpdate (prevProps) {
    const { onResized } = this.props

    if (onResized && prevProps.onResized !== onResized) {
      this.props.setBuildingWidth(this.streetSectionEditable)
    }
  }

  updateSegmentData = (ref, dataNo, segmentPos) => {
    const { segments } = this.props.street
    const segment = segments[dataNo]

    segment.el = ref
    segment.el.dataNo = dataNo
    segment.el.savedLeft = Math.round(segmentPos)
    segment.el.savedNoMoveLeft = Math.round(segmentPos)
    segment.el.cssTransformLeft = Math.round(segmentPos)
    segment.el.savedWidth = Math.round(segment.width * TILE_SIZE)
  }

  calculateSegmentPos = (dataNo) => {
    const { segments, remainingWidth } = this.props.street
    let currPos = remainingWidth / 2

    for (let i = 0; i < dataNo; i++) {
      currPos += segments[i].width
    }

    return (currPos * TILE_SIZE)
  }

  renderStreetSegments = () => {
    const { segments, units } = this.props.street

    return segments.map((segment, i) => {
      const segmentWidth = (segment.width * TILE_SIZE)
      const segmentPos = this.calculateSegmentPos(i)

      segment.variant = getVariantArray(segment.type, segment.variantString)
      segment.warnings = []

      if (!segment.randSeed) {
        segment.randSeed = generateRandSeed()
      }

      const segmentEl = (<Segment
        key={segment.randSeed}
        dataNo={i}
        type={segment.type}
        variantString={segment.variantString}
        width={segmentWidth}
        isUnmovable={false}
        forPalette={false}
        units={units}
        randSeed={segment.randSeed}
        segmentPos={segmentPos}
        updateSegmentData={this.updateSegmentData}
        calculatePerspective={this.props.calculatePerspective}
      />)

      return segmentEl
    })
  }

  render () {
    const style = {
      width: (this.props.street.width * TILE_SIZE) + 'px'
    }

    return (
      <div
        id="street-section-editable"
        key={this.props.street.id}
        style={style}
        ref={(ref) => { this.streetSectionEditable = ref }}
      >
        {this.renderStreetSegments()}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    street: state.street
  }
}

export default connect(mapStateToProps)(StreetEditable)
