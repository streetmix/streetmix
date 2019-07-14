import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
// import { segmentsChanged } from '../segments/view'
import { injectIntl } from 'react-intl'
// import { getSegmentInfo } from '../segments/info'
// import VARIANT_ICONS from '../segments/variant_icons.json'
// import { getVariantArray } from '../segments/variant_utils'
// import {
//   INFO_BUBBLE_TYPE_SEGMENT,
//   INFO_BUBBLE_TYPE_LEFT_BUILDING,
//   INFO_BUBBLE_TYPE_RIGHT_BUILDING
// } from './constants'
import { changeSegmentVariant } from '../store/actions/street'

export class SliderVariant extends React.Component {
  static propTypes = {
    changeSegmentVariant: PropTypes.func.isRequired,
    variant: PropTypes.string.isRequired,
    position: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.oneOf(['left', 'right'])
    ])
  }

  constructor (props) {
    super(props)

    this.state = {
      variantSets: null,
      value: 0
    }
    this.onChangeSlider = this.onChangeSlider.bind(this)
  }

  onChangeSlider (event) {
    const newValue = event.target.value
    this.setState({ value: newValue })
    // TODO don't hardcore this!
    this.props.changeSegmentVariant(this.props.position, 'parking-lane-rotation', newValue)
    // segmentsChanged()
  }

  render () {
    // Do not render this component if there are no variants to select
    const { variant } = this.props
    return (
      <div className="variants">
        Hello World {variant}
        <br />
        <input onChange={this.onChangeSlider} type="range" min="0" max="359" value={variant} className="slider" id="myRange" />
      </div>
    )
  }
}

function mapStateToProps (state, ownProps) {
  let variant
  let segmentType

  // Get the appropriate variant information
  if (Number.isInteger(ownProps.position) && state.street.segments[ownProps.position]) {
    const segment = state.street.segments[ownProps.position]
    variant = segment.variantString
    segmentType = segment.type
  }

  return {
    variant,
    segmentType,
    flags: state.flags
  }
}

function mapDispatchToProps (dispatch) {
  return {
    changeSegmentVariant: (position, set, selection) => { dispatch(changeSegmentVariant(position, set, selection)) }
  }
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SliderVariant))
