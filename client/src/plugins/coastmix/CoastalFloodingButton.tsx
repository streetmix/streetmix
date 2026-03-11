import { useDispatch, useSelector } from '~/src/store/hooks.js'
import { toggleCoastalFloodingPanel } from '~/src/store/slices/coastmix.js'
import { BetaTag } from '~/src/menubar/menus/BetaTag.js'
import { Button } from '~/src/ui/Button.js'
import { TutorialPopover } from '~src/ui/TutorialPopover.js'
import './CoastalFloodingButton.css'

export function CoastalFloodingButton() {
  const tutorialStep = useSelector((state) => state.app.tutorialStep)
  const dispatch = useDispatch()

  function handleClick() {
    dispatch(toggleCoastalFloodingPanel())
  }

  return (
    <div className="coastmix-controls-container">
      <TutorialPopover
        isOpen={tutorialStep === 2}
        label={`Click on "Coastal flooding" to access and adjust flood features.`}
        showNext={false}
        placement="right"
      >
        <Button onClick={handleClick} className="coastmix-controls-button">
          Coastal flooding <BetaTag />
        </Button>
      </TutorialPopover>
    </div>
  )
}
