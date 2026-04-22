import { useDispatch } from '~/src/store/hooks.js'
import { toggleCoastalFloodingPanel } from '~/src/store/slices/coastmix.js'
import { Button } from '~/src/ui/Button.js'
import './CoastalFloodingButton.css'

export function CoastalFloodingButton() {
  const dispatch = useDispatch()

  function handleClick() {
    dispatch(toggleCoastalFloodingPanel())
  }

  return (
    <div className="coastmix-controls-container">
      <Button onClick={handleClick} className="coastmix-controls-button">
        Coastal flooding
      </Button>
    </div>
  )
}
