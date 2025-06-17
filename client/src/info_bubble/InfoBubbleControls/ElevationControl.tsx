import React from 'react'
import { useIntl } from 'react-intl'

import VARIANT_ICONS from '~/src/segments/variant_icons.yaml'
import { segmentsChanged } from '~/src/segments/view'
import { useSelector, useDispatch } from '~/src/store/hooks'
import { changeSegmentProperties } from '~/src/store/slices/street'
import { Tooltip, TooltipGroup } from '~/src/ui/Tooltip'
import Button from '~/src/ui/Button'
import Icon from '~/src/ui/Icon'
import ElevationControlNew from './ElevationControlNew'

interface ElevationControlProps {
  position: number
}

function ElevationControl ({
  position
}: ElevationControlProps): React.ReactElement {
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const forceEnable = useSelector(
    (state) => state.flags.ELEVATION_CONTROLS_UNLOCKED.value
  )
  const coastmixMode = useSelector((state) => state.flags.COASTMIX_MODE.value)
  const segment = useSelector((state) => state.street.segments[position])

  const dispatch = useDispatch()
  const intl = useIntl()

  function isVariantCurrentlySelected (selection: string): boolean {
    let bool

    switch (selection) {
      case 'sidewalk': {
        bool = segment.elevation === 1
        break
      }
      case 'road':
        bool = segment.elevation === 0
        break
      default:
        bool = false
        break
    }

    return bool
  }

  function getButtonOnClickHandler (selection: string): () => void {
    let elevation: number

    switch (selection) {
      case 'sidewalk':
        elevation = 1
        break
      case 'road':
        elevation = 0
        break
    }

    return (): void => {
      dispatch(changeSegmentProperties(position, { elevation }))
      segmentsChanged()
    }
  }

  function renderButton (
    set: string,
    selection: string
  ): React.ReactElement | null {
    const icon = VARIANT_ICONS[set][selection]

    if (icon === undefined) return null

    let title = intl.formatMessage({
      id: `variant-icons.${set}|${selection}`,
      defaultMessage: icon.title
    })

    // Only subscribers can do this
    let isLocked = false

    if (!isSubscriber && !forceEnable) {
      isLocked = true
      const unlockConditionText = intl.formatMessage({
        id: 'plus.locked.sub',
        // Default message ends with a Unicode-only left-right order mark
        // to allow for proper punctuation in `rtl` text direction
        // This character is hidden from editors by default!
        defaultMessage: 'Upgrade to Streetmix+ to use!‎'
      })
      title += ' — ' + unlockConditionText
    }

    const isSelected = isVariantCurrentlySelected(selection)

    return (
      <Tooltip label={title} placement="bottom">
        <Button
          // title={title}
          className={isSelected ? 'variant-selected' : undefined}
          disabled={isSelected || isLocked}
          onClick={getButtonOnClickHandler(selection)}
        >
          <svg
            xmlns="http://www.w3.org/1999/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            className="icon"
          >
            {/* `xlinkHref` is preferred over `href` for compatibility with Safari */}
            <use xlinkHref={`#icon-${icon.id}`} />
          </svg>
          {isLocked && <Icon name="lock" />}
        </Button>
      </Tooltip>
    )
  }

  let controls
  if (coastmixMode) {
    controls = (
      <ElevationControlNew
        key={position}
        position={position}
        segment={segment}
      />
    )
  } else {
    controls = (
      <TooltipGroup>
        {renderButton('elevation', 'sidewalk')}
        {renderButton('elevation', 'road')}
      </TooltipGroup>
    )
  }

  return (
    <div className="variants">
      <h3 className="elevation-header">Elevation</h3>
      {controls}
    </div>
  )
}

export default ElevationControl
