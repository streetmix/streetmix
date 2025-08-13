import React from 'react'
import { useIntl } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import {
  setBuildingVariant,
  changeSegmentVariant
} from '~/src/store/slices/street'
import { segmentsChanged } from '~/src/segments/view'
import { getSegmentInfo } from '~/src/segments/info'
import VARIANT_ICONS from '~/src/segments/variant_icons.yaml'
import { getVariantInfo } from '~/src/segments/variant_utils'
import Button from '~/src/ui/Button'
import Icon from '~/src/ui/Icon'
import { Tooltip } from '~/src/ui/Tooltip'

import type { SectionElementTypeAndPosition } from '@streetmix/types'

function Variants (
  props: SectionElementTypeAndPosition
): React.ReactElement | null {
  const { type, position } = props

  // Get the appropriate variant information
  const variant = useSelector((state) => {
    if (type === 'boundary') {
      return state.street.boundary[position].variant
    } else {
      return state.street.segments[position].variantString
    }
  })
  const segment = useSelector((state) => {
    if (type === 'slice') {
      return state.street.segments[position]
    }

    return null
  })
  const flags = useSelector((state) => state.flags)
  const isSignedIn = useSelector((state) => state.user.signedIn)
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const dispatch = useDispatch()
  const intl = useIntl()

  let variantSets: string[] = []
  switch (type) {
    case 'slice': {
      const { variants } = getSegmentInfo(segment.type)
      variantSets = variants
      break
    }
    case 'boundary':
      variantSets = Object.keys(VARIANT_ICONS.building)
      break
    default:
      break
  }

  // Remove any empty entries
  variantSets = variantSets.filter((x) => x !== '')

  function isVariantCurrentlySelected (set: string, selection: string): boolean {
    let bool = false

    switch (type) {
      case 'slice': {
        if (segment) {
          const obj = getVariantInfo(segment.type, variant)
          bool = selection === obj[set as keyof typeof obj]
        }
        break
      }
      case 'boundary':
        bool = selection === variant
        break
      default:
        bool = false
        break
    }

    return bool
  }

  function getButtonOnClickHandler (set: string, selection: string): () => void {
    let handler

    switch (type) {
      case 'slice':
        handler = () => {
          dispatch(changeSegmentVariant(position, set, selection))
          segmentsChanged()
        }
        break
      case 'boundary':
        handler = () => {
          dispatch(setBuildingVariant(position, selection))
        }
        break
      default:
        handler = () => {}
        break
    }

    return handler
  }

  function renderButton (
    set: string,
    selection: string
  ): React.ReactElement | null {
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

    const isSelected = isVariantCurrentlySelected(set, selection)

    return (
      <Tooltip
        label={label}
        sublabel={sublabel}
        placement="bottom"
        key={set + '.' + selection}
      >
        <Button
          data-testid={icon.title}
          className={isSelected ? 'variant-selected' : undefined}
          disabled={isSelected || isLocked}
          onClick={getButtonOnClickHandler(set, selection)}
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

  function renderVariantsSelection (): Array<React.ReactElement | null> {
    const variantEls = []

    switch (type) {
      case 'slice': {
        let first = true

        // Each segment has some allowed variant sets (e.g. "direction")
        variantSets.forEach((set, variant, all) => {
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
        })

        break
      }
      case 'boundary': {
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
  if (variantSets.length === 0) return null

  return <div className="variants">{renderVariantsSelection()}</div>
}

export default Variants
