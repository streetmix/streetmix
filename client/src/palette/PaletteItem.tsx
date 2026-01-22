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
  element: SegmentDefinition
}

export function PaletteItem({ element }: PaletteItemProps) {
  const flags = useSelector((state) => state.flags)
  const isSignedIn = useSelector((state) => state.user.signedIn)
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const intl = useIntl()
  const [, drag, dragPreview] = useDrag(() =>
    createPaletteItemDragSpec(element)
  )

  // Get localized display names
  function getLabel(element: SegmentDefinition): string {
    const defaultMessage = element.name

    return intl.formatMessage({
      id: `segments.${element.nameKey}`,
      defaultMessage,
    })
  }

  const { unlockCondition } = element
  const classNames = ['palette-item']
  let isLocked = false
  let sublabel

  if (
    unlockCondition &&
    !(
      element.unlockWithFlag !== undefined &&
      flags[element.unlockWithFlag]?.value
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
    images.get(`thumbnails--${element.id}`)?.src ??
    images.get('thumbnails--missing')?.src

  return (
    <li className={classNames.join(' ')} ref={isLocked ? null : drag}>
      <Tooltip label={getLabel(element)} sublabel={sublabel}>
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
