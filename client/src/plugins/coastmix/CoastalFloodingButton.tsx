import { useDispatch } from '~/src/store/hooks.js'
import { showCoastalFloodingPanel } from '~/src/store/slices/coastmix.js'
import { BetaTag } from '~/src/menubar/menus/BetaTag.js'
import { Button } from '~/src/ui/Button.js'
import './CoastalFloodingButton.css'

export function CoastalFloodingButton() {
  const dispatch = useDispatch()

  function handleClick() {
    dispatch(showCoastalFloodingPanel())
  }

  return (
    <div className="coastmix-controls-container">
      <Button onClick={handleClick} className="coastmix-controls-button">
        Coastal flooding <BetaTag />
      </Button>
    </div>
  )
}
