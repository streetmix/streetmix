import { useDispatch } from '~/src/store/hooks.js'
import { toggleCoastalFloodingPanel } from '~/src/store/slices/coastmix.js'
import { BetaTag } from '~/src/menubar/menus/BetaTag.js'
import { Button } from '~/src/ui/Button.js'
import { TutorialPopover } from '~src/ui/TutorialPopover.js'
import './CoastalFloodingButton.css'

export function CoastalFloodingButton() {
  const dispatch = useDispatch()

  function handleClick() {
    dispatch(toggleCoastalFloodingPanel())
  }

  return (
    <div className="coastmix-controls-container">
      <TutorialPopover
        isOpen={true}
        label="Click on Coastal Flooding to access and adjust flood features."
        placement="right"
      >
        <Button onClick={handleClick} className="coastmix-controls-button">
          Coastal flooding <BetaTag />
        </Button>
      </TutorialPopover>
    </div>
  )
}
