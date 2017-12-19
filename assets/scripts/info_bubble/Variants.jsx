import React from 'react'
import PropTypes from 'prop-types'
// import { t } from '../app/locale'
import { SEGMENT_INFO } from '../segments/info'
import { VARIANT_ICONS } from '../segments/variant_icons'
import { changeSegmentVariant } from '../segments/view'
import { infoBubble } from './info_bubble'

// Duped from InfoBubble
const INFO_BUBBLE_TYPE_SEGMENT = 1
const INFO_BUBBLE_TYPE_LEFT_BUILDING = 2
const INFO_BUBBLE_TYPE_RIGHT_BUILDING = 3

export default class Variants extends React.Component {
  static propTypes = {
    type: PropTypes.number,
    dataNo: PropTypes.number,
    segment: PropTypes.object,
    street: PropTypes.object
  }

  isVariantCurrentlySelected = (type, choice) => {
    let value

    switch (this.props.type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        value = (this.props.segment.variant[type] === choice)
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
        value = (choice === this.props.street.leftBuildingVariant)
        break
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        value = (choice === this.props.street.rightBuildingVariant)
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
          infoBubble.onBuildingVariantButtonClick(null, true, choice)
        }
        break
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        handler = (event) => {
          infoBubble.onBuildingVariantButtonClick(null, false, choice)
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

    return (
      <button
        key={type + '.' + choice}
        title={variantIcon.title}
        disabled={this.isVariantCurrentlySelected(type, choice)}
        onClick={this.getButtonOnClickHandler(type, choice)}
      >
        <svg
          xmlns="http://www.w3.org/1999/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className="icon"
          style={variantIcon.color ? { fill: variantIcon.color } : null}
        >
          <use href={`#icon-${variantIcon.id}`} />
        </svg>
      </button>
    )
  }

  renderVariantsSelection = () => {
    const variantEls = []

    switch (this.props.type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        const segment = this.props.segment
        const segmentInfo = SEGMENT_INFO[segment.type]
        let first = true

        // Each segment has some allowed variant types (e.g. "direction")
        for (let variant in segmentInfo.variants) {
          const variantType = segmentInfo.variants[variant]

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
        Object.keys(VARIANT_ICONS['building']).map((building) => {
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
    return (
      <div className="variants">
        {this.renderVariantsSelection()}
      </div>
    )
  }
}
