import { useDispatch } from '~/src/store/hooks.js'
import { stopTour } from '~/src/store/slices/app.js'
import { Button } from '~/src/ui/Button.js'
import { CoastmixPracticeTour } from '~/src/ui/Tours/CoastmixPractice.js'
import Dialog from './Dialog.js'
import './CoastmixTutorial.css'

export function CoastmixTutorialComplete() {
  const dispatch = useDispatch()

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="dialog-coastmix-tutorial-complete">
          <header>
            <h2>Tutorial complete!</h2>
          </header>

          <div className="dialog-content">
            <p>
              Some common coastal resilience and waterfront adaptation
              strategies include seawalls, earthen berms, sandy dunes, and
              elevating buildings or infrastructure, such as roads, walkways,
              and more. All of these strategies can block flooding from
              overtopping an area.
            </p>
            <p>What do you want to do next?</p>
            <p
              style={{
                display: 'flex',
                margin: '0',
              }}
            >
              <CoastmixPracticeTour>
                <Button
                  onClick={() => {
                    closeDialog()
                  }}
                  primary
                >
                  Practice scenario
                </Button>
              </CoastmixPracticeTour>
              <Button
                onClick={() => {
                  dispatch(stopTour())
                  closeDialog()
                }}
                tertiary
              >
                Explore on my own
              </Button>
            </p>
          </div>
        </div>
      )}
    </Dialog>
  )
}
