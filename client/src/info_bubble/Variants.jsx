import React from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { segmentsChanged } from '../segments/view'
import { getSegmentInfo } from '../segments/info'
import VARIANT_ICONS from '../segments/variant_icons.json'
import { getVariantArray } from '../segments/variant_utils'
import {
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '../segments/constants'
import {
  setBuildingVariant,
  changeSegmentVariant
} from '../store/slices/street'
import Button from '../ui/Button'
import { ICON_LOCK } from '../ui/icons'
import {
  INFO_BUBBLE_TYPE_SEGMENT,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from './constants'
import ElevationControl from './ElevationControl'

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
  const segment = useSelector((state) => {
    if (Number.isInteger(position) && state.street.segments[position]) {
      return state.street.segments[position]
    }
  })
  const flags = useSelector((state) => state.flags)
  const isSignedIn = useSelector((state) => state.user.signedIn)
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const dispatch = useDispatch()
  const intl = useIntl()

  let variantSets = []
  let elevationToggle = false
  switch (type) {
    case INFO_BUBBLE_TYPE_SEGMENT: {
      const segmentInfo = getSegmentInfo(segment.type)
      if (segmentInfo) {
        variantSets = segmentInfo.variants
      }
      if (segmentInfo?.enableElevation) {
        elevationToggle = true
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
        const obj = getVariantArray(segment.type, variant)
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

    // If a variant is disabled by feature flag, skip it
    if (icon.enableWithFlag) {
      const flag = flags[icon.enableWithFlag]
      if (!flag || !flag.value) return null
    }

    let title = intl.formatMessage({
      id: `variant-icons.${set}|${selection}`,
      defaultMessage: icon.title
    })

    let isLocked = false

    // If there is an enable condition, add a note to the tooltip if it
    // is locked for a reason (e.g. must sign in, must be a subscriber)
    // If an "unlock flag" is set, enable the thing
    if (
      icon.unlockCondition &&
      !(icon.unlockWithFlag && flags[icon.unlockWithFlag]?.value === true)
    ) {
      let unlockConditionText
      switch (icon.unlockCondition) {
        case 'SUBSCRIBE':
          if (!isSubscriber) {
            isLocked = true
            unlockConditionText = intl.formatMessage({
              id: 'plus.locked.sub',
              // Default message ends with a Unicode-only left-right order mark
              // to allow for proper punctuation in `rtl` text direction
              // This character is hidden from editors by default!
              defaultMessage: 'Upgrade to Streetmix+ to use!‎'
            })
          }
          break
        case 'SIGN_IN':
        default:
          if (!isSignedIn) {
            isLocked = true
            unlockConditionText = intl.formatMessage({
              id: 'plus.locked.user',
              // Default message ends with a Unicode-only left-right order mark
              // to allow for proper punctuation in `rtl` text direction
              // This character is hidden from editors by default!
              defaultMessage: 'Sign in to use!‎'
            })
          }
          break
      }
      if (unlockConditionText) {
        title += ' — ' + unlockConditionText
      }
    }

    const isSelected = isVariantCurrentlySelected(set, selection)

    return (
      <Button
        key={set + '.' + selection}
        title={title}
        className={isSelected ? 'variant-selected' : null}
        disabled={isSelected || isLocked}
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
        {isLocked && <FontAwesomeIcon icon={ICON_LOCK} />}
      </Button>
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

        if (elevationToggle === true) {
          // Street vendors always have enabled elevation controls
          // regardless of subscriber state
          const forceEnable =
            segment.type === 'street-vendor' ||
            flags.ELEVATION_CONTROLS_UNLOCKED.value === true

          // React wants a unique key here
          variantEls.push(<hr key="elevation_divider" />)
          variantEls.push(
            <ElevationControl
              position={position}
              segment={segment}
              key="elevation_control"
              forceEnable={forceEnable}
            />
          )
        }

        break
      }
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING: {
        const els = variantSets.map((building) =>
          renderButton('building', building)
        )
        variantEls.push(...els)
        break
      }
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
