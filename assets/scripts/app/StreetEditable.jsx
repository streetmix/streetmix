import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Segment from '../segments/Segment'

import { TILE_SIZE } from '../segments/constants'

class StreetEditable extends React.Component {
  static propTypes = {
    onResized: PropTypes.bool.isRequired,
    setBuildingWidth: PropTypes.func.isRequired,
    street: PropTypes.object.isRequired
  }

  componentDidUpdate (prevProps) {
    const { onResized } = this.props

    if (onResized && prevProps.onResized !== onResized) {
      this.props.setBuildingWidth(this.streetSectionEditable)
    }
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
    const streetSegments = []

    segments.map((segment, i) => {
      const segmentWidth = (segment.width * TILE_SIZE)
      const segmentPos = this.calculateSegmentPos(i)

      const segmentEl = (<Segment
        key={segment.id}
        dataNo={i}
        type={segment.type}
        variantString={segment.variantString}
        width={segmentWidth}
        isUnmovable={false}
        forPalette={false}
        units={units}
        randSeed={segment.randSeed}
        segmentPos={segmentPos}
      />)

      streetSegments.push(segmentEl)
    })

    return streetSegments
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
