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
              2050 and beyond? Now that you've learned the basics of Coastmix,
              try changing the sea level rise projection year, or a start with a
              different coastal environment, and see what you can come up with!
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
