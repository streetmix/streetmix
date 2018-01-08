import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { t } from '../app/locale'
import { SEGMENT_INFO } from '../segments/info'
import { VARIANT_ICONS } from '../segments/variant_icons'
import { changeSegmentVariant } from '../segments/view'
import { infoBubble } from './info_bubble'
import { setBuildingVariant } from '../store/actions/street'

// Duped from InfoBubble
const INFO_BUBBLE_TYPE_SEGMENT = 1
const INFO_BUBBLE_TYPE_LEFT_BUILDING = 2
const INFO_BUBBLE_TYPE_RIGHT_BUILDING = 3

class Variants extends React.Component {
  static propTypes = {
    type: PropTypes.number,
    dataNo: PropTypes.number,
    segment: PropTypes.object,

    // Building
    variant: PropTypes.string,
    setBuildingVariant: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      variantTypes: this.getVariantTypes(props) // should be an array or undefined
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      variantTypes: this.getVariantTypes(nextProps)
    })
  }

  getVariantTypes = (props) => {
    const { type, segment } = props
    let variantTypes = []

    switch (type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        const segmentInfo = SEGMENT_INFO[segment.type]
        variantTypes = segmentInfo.variants
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        variantTypes = Object.keys(VARIANT_ICONS['building'])
        break
      default:
        break
    }

    // Return the array, removing any empty entries
    return variantTypes.filter((x) => x !== (undefined || null || ''))
  }

  isVariantCurrentlySelected = (type, choice) => {
    let value

    switch (this.props.type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        value = (this.props.segment.variant[type] === choice)
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        value = (choice === this.props.variant)
        break
      default:
        value = false
        break
    }

    return value
  }

  getButtonOnClickHandler = (type, choice) => {
    let handler

    switch (this.props.type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        handler = (event) => {
          changeSegmentVariant(this.props.dataNo, type, choice)
        }
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
        handler = (event) => {
          this.props.setBuildingVariant('left', choice)

          // TODO: remove legacy notification
          infoBubble.onBuildingVariantButtonClick('left')
        }
        break
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        handler = (event) => {
          this.props.setBuildingVariant('right', choice)

          // TODO: remove legacy notification
          infoBubble.onBuildingVariantButtonClick('right')
        }
        break
      default:
        handler = () => {}
        break
    }

    return handler
  }

  renderButton = (type, choice) => {
    const variantIcon = VARIANT_ICONS[type][choice]

    if (!variantIcon) return null

    const title = t(`variant-icons.${type}|${choice}`, variantIcon.title, { ns: 'segment-info' })

    return (
      <button
        key={type + '.' + choice}
        title={title}
        disabled={this.isVariantCurrentlySelected(type, choice)}
        onClick={this.getButtonOnClickHandler(type, choice)}
      >
        <svg
          xmlns="http://www.w3.org/1999/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className="icon"
          style={variantIcon.color ? { fill: variantIcon.color } : null}
        >
          {/* `xlinkHref` is preferred over `href` for compatibility with Safari */}
          <use xlinkHref={`#icon-${variantIcon.id}`} />
        </svg>
      </button>
    )
  }

  renderVariantsSelection = () => {
    const variantEls = []

    switch (this.props.type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        let first = true

        // Each segment has some allowed variant types (e.g. "direction")
        for (let variant in this.state.variantTypes) {
          const variantType = this.state.variantTypes[variant]

          // New row for each variant type
          if (!first) {
            const el = <hr key={variantType} />
            variantEls.push(el)
          } else {
            first = false
          }

          // Each variant type has some choices.
          // VARIANT_ICONS is an object containing a list of what
          // each of the choices are and data for building an icon.
          // Different segments may refer to the same variant type
          // ("direction" is a good example of this)
          for (let variantChoice in VARIANT_ICONS[variantType]) {
            const el = this.renderButton(variantType, variantChoice)

            variantEls.push(el)
          }
        }
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        this.state.variantTypes.map((building) => {
          const el = this.renderButton('building', building)
          variantEls.push(el)
        })
        break
      default:
        break
    }

    return variantEls
  }

  render () {
    // Do not render this component if there are no variants to select
    if (!this.state.variantTypes || this.state.variantTypes.length === 0) return null

    return (
      <div className="variants">
        {this.renderVariantsSelection()}
      </div>
    )
  }
}

function mapStateToProps (state, ownProps) {
  const isLeft = ownProps.type === INFO_BUBBLE_TYPE_LEFT_BUILDING
  const isRight = ownProps.type === INFO_BUBBLE_TYPE_RIGHT_BUILDING

  return {
    // Get the appropriate building data based on which side of street it's on
    variant: (isLeft) ? state.street.leftBuildingVariant : (isRight) ? state.street.rightBuildingVariant : null
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setBuildingVariant: (position, variant) => { dispatch(setBuildingVariant(position, variant)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Variants)
