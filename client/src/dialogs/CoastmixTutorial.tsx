import { useDispatch } from '~/src/store/hooks.js'
import { skipTutorial } from '~/src/store/slices/app.js'
import { Button } from '~/src/ui/Button.js'
import Dialog from './Dialog.js'
import './CoastmixTutorial.css'

export function CoastmixTutorialComplete() {
  const dispatch = useDispatch()

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="dialog-coastmix-tutorial-complete">
          <header>
            <h1>Tutorial complete!</h1>
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
                justifyContent: 'center',
                gap: '0.5em',
                margin: '0',
              }}
            >
              <Button
                onClick={() => {
                  dispatch(skipTutorial())
                  closeDialog()
                }}
                primary
              >
                Practice scenario
              </Button>
              <Button
                onClick={() => {
                  dispatch(skipTutorial())
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
