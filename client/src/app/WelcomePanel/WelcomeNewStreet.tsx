import { FormattedMessage } from 'react-intl'

import { Button } from '~/src/ui/Button.js'

interface WelcomeNewStreetProps {
  handleDismiss: React.MouseEventHandler
}

export function WelcomeNewStreet({ handleDismiss }: WelcomeNewStreetProps) {
  return (
    <div className="welcome-panel-content">
      <h1>
        <FormattedMessage
          id="dialogs.new-street.heading"
          defaultMessage="Here’s your new street."
        />
      </h1>
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
