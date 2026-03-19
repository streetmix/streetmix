import { Button } from '~/src/ui/Button.js'
import Dialog from './Dialog.js'
import './CoastmixTutorial.css'

export function CoastmixPracticeComplete() {
  return (
    <Dialog>
      {(closeDialog) => (
        <div className="dialog-coastmix-tutorial-complete">
          <header>
            <h2>Scenario complete!</h2>
          </header>

          <div className="dialog-content">
            <p>Congratulations &mdash; you did it!</p>
            <p>
              You've prepared for 2030 sea level rise, but can you prepare for
              2050 and beyond? Try changing the sea level rise target year, or a
              different starting environment, and see what you can come up with!
            </p>
            <p
              style={{
                display: 'flex',
                margin: '0',
              }}
            >
              <Button onClick={closeDialog} primary>
                Explore Coastmix
              </Button>
            </p>
          </div>
        </div>
      )}
    </Dialog>
  )
}
