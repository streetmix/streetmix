import React from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { segmentsChanged } from '../segments/view'
import { getSegmentInfo } from '../segments/info'
import VARIANT_ICONS from '../segments/variant_icons.json'
import { getVariantArray } from '../segments/variant_utils'
import {
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '../segments/constants'
import {
  INFO_BUBBLE_TYPE_SEGMENT,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from './constants'
import {
  setBuildingVariant,
  changeSegmentVariant
} from '../store/actions/street'

Variants.propTypes = {
  type: PropTypes.number,
  position: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf([BUILDING_LEFT_POSITION, BUILDING_RIGHT_POSITION])
  ])
}

function Variants (props) {
  const { type, position } = props

  // Get the appropriate variant information
  const variant = useSelector((state) => {
    if (position === BUILDING_LEFT_POSITION) {
      return state.street.leftBuildingVariant
    } else if (position === BUILDING_RIGHT_POSITION) {
      return state.street.rightBuildingVariant
    } else if (Number.isInteger(position) && state.street.segments[position]) {
      return state.street.segments[position].variantString
    }
  })
  const segmentType = useSelector((state) => {
    if (Number.isInteger(position) && state.street.segments[position]) {
      return state.street.segments[position].type
    }
  })
  const flags = useSelector((state) => state.flags)
  const dispatch = useDispatch()
  const intl = useIntl()

  let variantSets = []
  switch (type) {
    case INFO_BUBBLE_TYPE_SEGMENT: {
      const segmentInfo = getSegmentInfo(segmentType)
      if (segmentInfo) {
        variantSets = segmentInfo.variants
      }
      break
    }
    case INFO_BUBBLE_TYPE_LEFT_BUILDING:
    case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
      variantSets = Object.keys(VARIANT_ICONS.building)
      break
    default:
      break
  }

  // Remove any empty entries
  variantSets = variantSets.filter((x) => x !== (undefined || null || ''))

  function isVariantCurrentlySelected (set, selection) {
    let bool

    switch (type) {
      case INFO_BUBBLE_TYPE_SEGMENT: {
        const obj = getVariantArray(segmentType, variant)
        bool = selection === obj[set]
        break
      }
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        bool = selection === variant
        break
      default:
        bool = false
        break
    }

    return bool
  }

  function getButtonOnClickHandler (set, selection) {
    let handler

    switch (type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        handler = (event) => {
          dispatch(changeSegmentVariant(position, set, selection))
          segmentsChanged()
        }
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
        handler = (event) => {
          dispatch(setBuildingVariant(BUILDING_LEFT_POSITION, selection))
        }
        break
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        handler = (event) => {
          dispatch(setBuildingVariant(BUILDING_RIGHT_POSITION, selection))
        }
        break
      default:
        handler = () => {}
        break
    }

    return handler
  }

  function renderButton (set, selection) {
    const icon = VARIANT_ICONS[set][selection]

    if (!icon) return null

    const title = intl.formatMessage({
      id: `variant-icons.${set}|${selection}`,
      defaultMessage: icon.title
    })

    // Segments that are only enabled with a flag checks to see if flag
    // is set to true. If not, bail.
    if (icon.enableWithFlag) {
      const flag = flags[icon.enableWithFlag]
      if (!flag) return null
      if (!flag.value) return null
    }

    return (
      <button
        key={set + '.' + selection}
        title={title}
        disabled={isVariantCurrentlySelected(set, selection)}
        onClick={getButtonOnClickHandler(set, selection)}
      >
        <svg
          xmlns="http://www.w3.org/1999/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className="icon"
          style={icon.color ? { fill: icon.color } : null}
        >
          {/* `xlinkHref` is preferred over `href` for compatibility with Safari */}
          <use xlinkHref={`#icon-${icon.id}`} />
        </svg>
      </button>
    )
  }

  function renderVariantsSelection () {
    const variantEls = []

    switch (type) {
      case INFO_BUBBLE_TYPE_SEGMENT: {
        let first = true

        // Each segment has some allowed variant sets (e.g. "direction")
        for (const variant in variantSets) {
          const set = variantSets[variant]

          // New row for each variant set
          if (!first) {
            const el = <hr key={set} />
            variantEls.push(el)
          } else {
            first = false
          }

          // Each variant set has some selection choices.
          // VARIANT_ICONS is an object containing a list of what
          // each of the selections are and data for building an icon.
          // Different segments may refer to the same variant set
          // ("direction" is a good example of this)
          for (const selection in VARIANT_ICONS[set]) {
            const el = renderButton(set, selection)

            variantEls.push(el)
          }
        }
        break
      }
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        variantSets.map((building) => {
          const el = renderButton('building', building)
          variantEls.push(el)
        })
        break
      default:
        break
    }

    return variantEls
  }

  // Do not render this component if there are no variants to select
  if (!variantSets || variantSets.length === 0) return null

  return <div className="variants">{renderVariantsSelection()}</div>
}

export default Variants
