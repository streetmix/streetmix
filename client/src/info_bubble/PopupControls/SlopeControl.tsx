import { FormattedMessage } from 'react-intl'
import { getSegmentInfo } from '@streetmix/parts'

import { segmentsChanged } from '~/src/segments/view.js'
import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { toggleSliceSlope } from '~/src/store/slices/street.js'
import Switch from '~/src/ui/Switch.js'

interface SlopeControlProps {
  position: number
}

export function SlopeControl({ position }: SlopeControlProps) {
  const slice = useSelector((state) => {
    return state.street.segments[position]
  })
  const dispatch = useDispatch()

  const { rules } = getSegmentInfo(slice.type)
  // Allow sloping when slope rule is `path` or `berm`. Defaults to false.
  const allowSlope = rules?.slope === 'path' || rules?.slope === 'berm'
  const isSloped = allowSlope && slice.slope.on

  function handleSlopeChange(checked: boolean): void {
    dispatch(toggleSliceSlope(position, checked))
    segmentsChanged()
  }

  return (
    <div className="popup-control-row">
      <div className="popup-control-label">
        <FormattedMessage id="segments.controls.slope" defaultMessage="Slope" />
      </div>
      <div>
        <Switch
          onCheckedChange={handleSlopeChange}
          checked={isSloped}
          disabled={!allowSlope}
        />
      </div>
    </div>
  )
}
