import { useShepherd } from 'react-shepherd'

import { useDispatch } from '~/src/store/hooks.js'
import { startTour, stopTour } from '~/src/store/slices/app.js'
import { Button } from '~/src/ui/Button.js'
import { steps } from '~/src/ui/tours/coastmix-practice.js'
import Dialog from './Dialog.js'
import './CoastmixTutorial.css'

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: false,
    },
  },
  useModalOverlay: true,
}

export function CoastmixTutorialComplete() {
  const dispatch = useDispatch()

  const Shepherd = useShepherd()
  const tour = new Shepherd.Tour({
    ...tourOptions,
    steps: steps,
  })

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
              <Button
                onClick={() => {
                  tour.start()
                  dispatch(startTour())
                  closeDialog()
                }}
                primary
              >
                Practice scenario
              </Button>
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
