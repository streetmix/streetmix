import React from 'react'
import { useIntl } from 'react-intl'

import { useSelector } from '~/src/store/hooks'
import VARIANT_ICONS from '~/src/segments/variant_icons.yaml'
import Button from '~/src/ui/Button'
import Icon from '~/src/ui/Icon'
import { Tooltip } from '~/src/ui/Tooltip'
import './VariantButton.css'

interface VariantButtonProps {
  set: string
  selection: string
  isSelected: boolean
  onClick: () => void
}

export function VariantButton (
  props: VariantButtonProps
): React.ReactElement | null {
  const { set, selection, isSelected, onClick } = props
  const flags = useSelector((state) => state.flags)
  const isSignedIn = useSelector((state) => state.user.signedIn)
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const intl = useIntl()

  const icon = VARIANT_ICONS[set][selection]

  if (icon === undefined) return null

  // If a variant is disabled by feature flag, skip it
  if (icon.enableWithFlag !== undefined) {
    const flag = flags[icon.enableWithFlag]
    if (!flag?.value) return null
  }

  const label = intl.formatMessage({
    id: `variant-icons.${set}|${selection}`,
    defaultMessage: icon.title
  })

  let isLocked = false
  let sublabel

  // If there is an enable condition, add a note to the tooltip if it
  // is locked for a reason (e.g. must sign in, must be a subscriber)
  // If an "unlock flag" is set, enable the thing
  if (
    icon.unlockCondition !== undefined &&
    !(icon.unlockWithFlag !== undefined && flags[icon.unlockWithFlag]?.value)
  ) {
    switch (icon.unlockCondition) {
      case 'SUBSCRIBE':
        if (!isSubscriber) {
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

  return (
    <Tooltip label={label} sublabel={sublabel} placement="bottom">
      <Button
        data-testid={icon.title}
        className={isSelected ? 'variant-selected' : undefined}
        disabled={isSelected || isLocked}
        onClick={onClick}
      >
        <svg
          xmlns="http://www.w3.org/1999/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className="icon"
          style={icon.color !== undefined ? { fill: icon.color } : undefined}
        >
          <use href={`#icon-${icon.id}`} />
        </svg>
        {isLocked && <Icon name="lock" />}
      </Button>
    </Tooltip>
  )
}
