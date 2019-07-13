import React from 'react'
// import PropTypes from 'prop-types'
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
  // static propTypes = {
  //   intl: intlShape.isRequired,
  //   type: PropTypes.number,
  //   position: PropTypes.oneOfType([
  //     PropTypes.number,
  //     PropTypes.oneOf(['left', 'right'])
  //   ]),
  //   variant: PropTypes.string,
  //   segmentType: PropTypes.string,
  //   changeSegmentVariant: PropTypes.func.isRequired,
  //   flags: PropTypes.object.isRequired
  // }

  constructor (props) {
    super(props)

    this.state = {
      variantSets: null
    }
  }

  // static getDerivedStateFromProps (nextProps, prevState) {
  //   let variantSets = []

  //   switch (nextProps.type) {
  //     case INFO_BUBBLE_TYPE_SEGMENT:
  //       const segmentInfo = getSegmentInfo(nextProps.segmentType)
  //       if (segmentInfo) {
  //         variantSets = segmentInfo.variants
  //       }
  //       break
  //     case INFO_BUBBLE_TYPE_LEFT_BUILDING:
  //     case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
  //       variantSets = Object.keys(VARIANT_ICONS['building'])
  //       break
  //     default:
  //       break
  //   }

  //   // Return the array, removing any empty entries
  //   return {
  //     variantSets: variantSets.filter((x) => x !== (undefined || null || ''))
  //   }
  // }

  // isVariantCurrentlySelected = (set, selection) => {
  //   let bool

  //   switch (this.props.type) {
  //     case INFO_BUBBLE_TYPE_SEGMENT: {
  //       const obj = getVariantArray(this.props.segmentType, this.props.variant)
  //       bool = (selection === obj[set])
  //       break
  //     }
  //     case INFO_BUBBLE_TYPE_LEFT_BUILDING:
  //     case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
  //       bool = (selection === this.props.variant)
  //       break
  //     default:
  //       bool = false
  //       break
  //   }

  //   return bool
  // }

  // getButtonOnClickHandler = (set, selection) => {
  //   let handler

  //   switch (this.props.type) {
  //     case INFO_BUBBLE_TYPE_SEGMENT:
  //       handler = (event) => {
  //         this.props.changeSegmentVariant(this.props.position, set, selection)
  //         segmentsChanged()
  //       }
  //       break
  //     default:
  //       handler = () => {}
  //       break
  //   }

  //   return handler
  // }

  // renderButton = (set, selection) => {
  //   const icon = VARIANT_ICONS[set][selection]

  //   if (!icon) return null

  //   const title = this.props.intl.formatMessage({
  //     id: `variant-icons.${set}|${selection}`,
  //     defaultMessage: icon.title
  //   })

  //   // Segments that are only enabled with a flag checks to see if flag
  //   // is set to true. If not, bail.
  //   if (icon.enableWithFlag) {
  //     const flag = this.props.flags[icon.enableWithFlag]
  //     if (!flag) return null
  //     if (!flag.value) return null
  //   }

  //   return (
  //     <button
  //       key={set + '.' + selection}
  //       title={title}
  //       disabled={this.isVariantCurrentlySelected(set, selection)}
  //       onClick={this.getButtonOnClickHandler(set, selection)}
  //     >
  //       <svg
  //         xmlns="http://www.w3.org/1999/svg"
  //         xmlnsXlink="http://www.w3.org/1999/xlink"
  //         className="icon"
  //         style={icon.color ? { fill: icon.color } : null}
  //       >
  //         {/* `xlinkHref` is preferred over `href` for compatibility with Safari */}
  //         <use xlinkHref={`#icon-${icon.id}`} />
  //       </svg>
  //     </button>
  //   )
  // }

  // renderVariantsSelection = () => {
  //   const variantEls = []

  //   switch (this.props.type) {
  //     case INFO_BUBBLE_TYPE_SEGMENT:
  //       let first = true

  //       // Each segment has some allowed variant sets (e.g. "direction")
  //       for (let variant in this.state.variantSets) {
  //         const set = this.state.variantSets[variant]

  //         // New row for each variant set
  //         if (!first) {
  //           const el = <hr key={set} />
  //           variantEls.push(el)
  //         } else {
  //           first = false
  //         }

  //         // Each variant set has some selection choices.
  //         // VARIANT_ICONS is an object containing a list of what
  //         // each of the selections are and data for building an icon.
  //         // Different segments may refer to the same variant set
  //         // ("direction" is a good example of this)
  //         for (let selection in VARIANT_ICONS[set]) {
  //           const el = this.renderButton(set, selection)

  //           variantEls.push(el)
  //         }
  //       }
  //       break
  //     case INFO_BUBBLE_TYPE_LEFT_BUILDING:
  //     case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
  //       this.state.variantSets.map((building) => {
  //         const el = this.renderButton('building', building)
  //         variantEls.push(el)
  //       })
  //       break
  //     default:
  //       break
  //   }

  //   return variantEls
  // }

  render () {
    // Do not render this component if there are no variants to select

    return (
      <div className="variants">
        Hello World
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
