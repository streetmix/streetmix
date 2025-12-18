import { useId } from 'react'
import { FormattedMessage } from 'react-intl'
import { getSegmentVariantInfo } from '@streetmix/parts'

import { segmentsChanged } from '~/src/segments/view.js'
import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { toggleSliceSlope } from '~/src/store/slices/street.js'
import { Popover } from '~/src/ui/Popover.js'
import { Switch } from '~/src/ui/Switch.js'

interface SlopeControlProps {
  position: number
}

export function SlopeControl({ position }: SlopeControlProps) {
  // TODO: consider passing slice and slice info into this component, one
  // level up -- because other sibling components may need it too
  const slice = useSelector((state) => {
    return state.street.segments[position]
  })
  const dispatch = useDispatch()
  const labelId = useId()

  // Allow sloping when slope rule is `path` or `berm`. Defaults to false.
  const { slope } = getSegmentVariantInfo(slice.type, slice.variantString)
  const allowSlope = slope === 'path' || slope === 'berm'
  const isSloped = allowSlope && slice.slope.on

  function handleSlopeChange(checked: boolean): void {
    dispatch(toggleSliceSlope(position, checked))
    segmentsChanged()
  }

  return (
    <div className="popup-control-row">
      <div className="popup-control-label" id={labelId}>
        <FormattedMessage
          id="segments.controls.slope.label"
          defaultMessage="Slope"
        />
        {!allowSlope && (
          // TODO: use a different icon
          <Popover>
            <FormattedMessage
              id="segments.controls.slope.disabled-tooltip"
              defaultMessage="This element cannot be sloped."
            />
          </Popover>
        )}
      </div>
      <div>
        <Switch
          onCheckedChange={handleSlopeChange}
          checked={isSloped}
          disabled={!allowSlope}
          aria-labelledby={labelId}
        />
      </div>
    </div>
  )
}
