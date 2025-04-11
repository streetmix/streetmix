import React from 'react'
import { FormattedMessage } from 'react-intl'

import Dialog from '../Dialog'
import './NewStreetDialog.css'

function NewStreetDialog (): React.ReactElement {
  return (
    <Dialog>
      {() => (
        <div className="new-street-dialog">
          <header>
            <h1>
              <FormattedMessage
                id="dialogs.new-street.heading"
                defaultMessage="New street"
              />
            </h1>
          </header>
          <div className="dialog-content">
            <p>Stuff</p>
          </div>
        </div>
      )}
    </Dialog>
  )
}

export default NewStreetDialog
