import React from 'react'
import { FormattedMessage } from 'react-intl'

import Button from '~/src/ui/Button.js'

interface NewStreetProps {
  handleDismiss: React.MouseEventHandler
}

function NewStreet({ handleDismiss }: NewStreetProps) {
  return (
    <div className="welcome-panel-content new-street">
      <h1>
        <FormattedMessage
          id="dialogs.new-street.heading"
          defaultMessage="Here’s your new street."
        />
      </h1>
      <Button primary onClick={handleDismiss}>
        <FormattedMessage
          id="dialogs.new-street.dismiss"
          defaultMessage="Let’s go!&lrm;"
        />
      </Button>
    </div>
  )
}

export default NewStreet
