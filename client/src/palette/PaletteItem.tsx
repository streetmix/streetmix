import { useIntl } from 'react-intl'
import { useDrag } from 'react-dnd'

import { useSelector } from '../store/hooks.js'
import { images } from '../app/load_resources.js'
import Icon from '../ui/Icon.js'
import { Tooltip } from '../ui/Tooltip.js'
import { EmptyDragPreview } from '../ui/dnd/EmptyDragPreview.js'
import { createPaletteItemDragSpec } from '../segments/drag_and_drop.js'

import type { SegmentDefinition } from '@streetmix/types'
import './PaletteItem.css'

interface PaletteItemProps {
  item: SegmentDefinition
}

export function PaletteItem({ item }: PaletteItemProps) {
  const flags = useSelector((state) => state.flags)
  const isSignedIn = useSelector((state) => state.user.signedIn)
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const intl = useIntl()
  const [, drag, dragPreview] = useDrag(() => createPaletteItemDragSpec(item))

  // Get localized display names
  function getLabel(item: SegmentDefinition): string {
    const defaultMessage = item.name

    return intl.formatMessage({
      id: `segments.${item.nameKey}`,
      defaultMessage,
    })
  }

  const { unlockCondition } = item
  const classNames = ['palette-item']
  let isLocked = false
  let sublabel

  if (
    unlockCondition &&
    !(item.unlockWithFlag !== undefined && flags[item.unlockWithFlag]?.value)
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
            defaultMessage: 'Upgrade to Streetmix+ to use!‎',
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
            defaultMessage: 'Sign in to use!‎',
          })
        }
        break
    }
  }

  const thumbnail =
    images.get(`thumbnails--${item.id}`)?.src ??
    images.get('thumbnails--missing')?.src

  return (
    <li className={classNames.join(' ')} ref={isLocked ? null : drag}>
      <Tooltip label={getLabel(item)} sublabel={sublabel}>
        <button>
          <img
            className="palette-item-image"
            src={thumbnail}
            draggable={false}
          />
        </button>
      </Tooltip>
      {isLocked && <Icon name="lock" />}
      <EmptyDragPreview dragPreview={dragPreview} />
    </li>
  )
}
