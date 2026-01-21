import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { showCoastalFloodingPanel } from '~/src/store/slices/coastmix.js'
import { BetaTag } from '~/src/menubar/menus/BetaTag.js'
import { Button } from '~/src/ui/Button.js'
import './CoastalFloodingButton.css'

import type { SectionElementTypeAndPosition } from '@streetmix/types'

export function CoastalFloodingButton(props: SectionElementTypeAndPosition) {
  const { type, position } = props

  // Get the appropriate variant information
  const variant = useSelector((state) => {
    if (type === 'boundary') {
      return state.street.boundary[position].variant
    }

    return null
  })
  const dispatch = useDispatch()

  const isCoastalBoundary =
    variant === 'waterfront' ||
    variant === 'water' ||
    variant === 'beach' ||
    variant === 'marsh' ||
    variant === 'dock'

  if (type === 'slice' || !isCoastalBoundary) return null

  function handleClick() {
    dispatch(showCoastalFloodingPanel())
  }

  return (
    <div className="popup-control-group">
      <Button onClick={handleClick} className="coastmix-controls-button">
        Coastal flooding <BetaTag />
      </Button>
    </div>
  )
}
