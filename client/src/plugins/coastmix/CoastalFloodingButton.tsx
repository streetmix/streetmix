import { useDispatch, useSelector } from '~/src/store/hooks.js'
import { nextTutorialStep } from '~/src/store/slices/app.js'
import { toggleCoastalFloodingPanel } from '~/src/store/slices/coastmix.js'
import { BetaTag } from '~/src/menubar/menus/BetaTag.js'
import { Button } from '~/src/ui/Button.js'
import { TutorialPopover } from '~src/ui/TutorialPopover.js'
import './CoastalFloodingButton.css'

const THIS_TUTORIAL_STEP = 2

export function CoastalFloodingButton() {
  const tutorialStep = useSelector((state) => state.app.tutorialStep)
  const dispatch = useDispatch()

  function handleClick() {
    dispatch(toggleCoastalFloodingPanel())

    if (tutorialStep === THIS_TUTORIAL_STEP) {
      dispatch(nextTutorialStep())
    }
  }

  return (
    <div className="coastmix-controls-container">
      <TutorialPopover
        isOpen={tutorialStep === THIS_TUTORIAL_STEP}
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
