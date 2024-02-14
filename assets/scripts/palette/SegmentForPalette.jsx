/**
 * Segments in the Palette component render differently (and have differen
 * logic and behavior) to segments rendered on the street.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { images } from '../app/load_resources'
import Tooltip from '../ui/Tooltip'
import { ICON_LOCK } from '../ui/icons'
import {
  Types,
  paletteSegmentSource,
  collectDragSource
} from '../segments/drag_and_drop'
import './SegmentForPalette.scss'

SegmentForPalette.propTypes = {
  // Provided by react-dnd
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,

  // Provided by parent
  segment: PropTypes.object,
  unlockCondition: PropTypes.oneOf(['SIGN_IN', 'SUBSCRIBE']),
  randSeed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  tooltipTarget: PropTypes.object
}

function SegmentForPalette ({
  segment,
  unlockCondition,
  randSeed,
  tooltipTarget,
  ...props
}) {
  const flags = useSelector((state) => state.flags)
  const isSignedIn = useSelector((state) => state.user.signedIn)
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const intl = useIntl()

  props.connectDragPreview(getEmptyImage(), { captureDraggingState: true })

  // Get localized display names
  function getLabel (segment) {
    const defaultMessage = segment.name

    return intl.formatMessage({
      id: `segments.${segment.nameKey}`,
      defaultMessage
    })
  }

  const classNames = ['segment', 'segment-in-palette']
  let isLocked = false
  let sublabel = null

  if (
    unlockCondition &&
    !(segment.unlockWithFlag && flags[segment.unlockWithFlag]?.value === true)
  ) {
    switch (unlockCondition) {
      case 'SUBSCRIBE':
        if (!isSubscriber) {
          classNames.push('segment-disabled')
          isLocked = true
          sublabel = intl.formatMessage({
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
          classNames.push('segment-disabled')
          isLocked = true
          sublabel = intl.formatMessage({
            id: 'plus.locked.user',
            // Default message ends with a Unicode-only left-right order mark
            // to allow for proper punctuation in `rtl` text direction
            // This character is hidden from editors by default!
            defaultMessage: 'Sign in to use!‎'
          })
        }
        break
    }
  }

  const thumbnail =
    images.get(`thumbnails--${segment.id}`)?.src ||
    images.get('thumbnails--missing')?.src
  const node = (
    <li className={classNames.join(' ')}>
      <Tooltip
        target={tooltipTarget}
        label={getLabel(segment)}
        sublabel={sublabel}
      >
        {/* Wrapper element necessary for <Tooltip />
            (alternate solution is to forward ref)
            This wrapper element is also the target for hover / focus
            in order the activate the tooltip. */}
        <div tabIndex="0">
          <img className="segment-image" src={thumbnail} />
        </div>
      </Tooltip>
      {isLocked && <FontAwesomeIcon icon={ICON_LOCK} />}
    </li>
  )

  // If disabled, return node as-is.
  // Otherwise, return node wrapped with react-dnd abilities.
  if (isLocked) {
    return node
  } else {
    return props.connectDragSource(node)
  }
}

export default DragSource(
  Types.PALETTE_SEGMENT,
  paletteSegmentSource,
  collectDragSource
)(SegmentForPalette)
