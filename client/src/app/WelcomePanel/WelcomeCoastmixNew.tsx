import { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { useShepherd } from 'react-shepherd'

import { tourOptions } from '~/src/ui/Tours'
import { steps } from '~/src/ui/Tours/coastmix-practice.js'
import { Button } from '~/src/ui/Button.js'

interface WelcomeCoastmixNewProps {
  handleDismiss: () => void
}

/* eslint-disable formatjs/no-literal-string-in-jsx */

export function WelcomeCoastmixNew({ handleDismiss }: WelcomeCoastmixNewProps) {
  const Shepherd = useShepherd()

  // Run on mount
  useEffect(() => {
    // Are we running a tour?
    const params = new URLSearchParams(window.location.search)
    const isTour = params.get('tour') === 'true'
    if (isTour && !Shepherd.activeTour) {
      const tour = new Shepherd.Tour({
        ...tourOptions,
        steps,
      })
      tour.start()
      handleDismiss()
    }
  }, [Shepherd.Tour, Shepherd.activeTour, handleDismiss])

  return (
    <div className="welcome-panel-content welcome-coastmix">
      <h1>Here’s your new waterfront.</h1>
      <div className="welcome-panel-buttons">
        <Button primary onClick={handleDismiss}>
          <FormattedMessage
            id="dialogs.new-street.dismiss"
            defaultMessage="Let’s go!&lrm;"
          />
        </Button>
      </div>
    </div>
  )
}
