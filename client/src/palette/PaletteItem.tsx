import React from 'react'
import { useIntl } from 'react-intl'
import {
  DragSource,
  type ConnectDragPreview,
  type ConnectDragSource
} from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useSelector } from '../store/hooks'
import { images } from '../app/load_resources'
import Tooltip from '../ui/Tooltip'
import { ICON_LOCK } from '../ui/icons'
import {
  Types,
  paletteSegmentSource,
  collectDragSource
} from '../segments/drag_and_drop'

import type { SegmentDefinition } from '@streetmix/types'
import type { TippyProps } from '@tippyjs/react'
import './PaletteItem.scss'

interface PaletteItemProps {
  // Provided by react-dnd HOC
  connectDragSource: ConnectDragSource
  connectDragPreview: ConnectDragPreview

  // Provided by parent
  segment: SegmentDefinition
  unlockCondition?: 'SIGN_IN' | 'SUBSCRIBE'
  tooltipTarget?: TippyProps['singleton']
}

function PaletteItem ({
  segment,
  unlockCondition,
  tooltipTarget,
  ...props
}: PaletteItemProps): React.ReactElement | null {
  const flags = useSelector((state) => state.flags)
  const isSignedIn = useSelector((state) => state.user.signedIn)
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const intl = useIntl()

  props.connectDragPreview(getEmptyImage(), { captureDraggingState: true })

  // Get localized display names
  function getLabel (segment: SegmentDefinition): string {
    const defaultMessage = segment.name

    return intl.formatMessage({
      id: `segments.${segment.nameKey}`,
      defaultMessage
    })
  }

  const classNames = ['palette-item']
  let isLocked = false
  let sublabel

  if (
    unlockCondition &&
    !(
      segment.unlockWithFlag !== undefined &&
      flags[segment.unlockWithFlag]?.value
    )
  ) {
    switch (unlockCondition) {
      case 'SUBSCRIBE':
        if (!isSubscriber) {
          classNames.push('palette-item-disabled')
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
          classNames.push('palette-item-disabled')
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
    images.get(`thumbnails--${segment.id}`)?.src ??
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
        <div tabIndex={0}>
          <img
            className="palette-item-image"
            src={thumbnail}
            draggable={false}
          />
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
)(PaletteItem)
