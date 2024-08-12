import React from 'react'
import { FormattedMessage } from 'react-intl'

import ExternalLink from '../ui/ExternalLink'
import Dialog from './Dialog'
import './ErrorDialog.css'

/**
 * The error dialog is displayed in place of another dialog if something
 * goes wrong in the other dialog.
 *
 * If _this_ component throws an error, the universe blows up.
 */
function ErrorDialog (): React.ReactElement {
  return (
    <Dialog>
      {(closeDialog) => (
        <div className="dialog-error">
          <header>
            <h1>
              <FormattedMessage
                id="dialogs.error.heading"
                defaultMessage="Oops!"
              />
            </h1>
          </header>
          <div className="dialog-content">
            <p>
              <FormattedMessage
                id="dialogs.error.text"
                defaultMessage="Something unexpected happened 😢. We’ve logged the error, but if you can remember what happened on the way here, <a>please tell us about it</a>. This could also be a temporary problem, so please try one more time."
                values={{
                  // eslint-disable-next-line react/display-name
                  a: (chunks) => (
                    <ExternalLink href="https://github.com/streetmix/streetmix/issues/new">
                      {chunks}
                    </ExternalLink>
                  )
                }}
              />
            </p>
          </div>
          <button className="dialog-primary-action" onClick={closeDialog}>
            <FormattedMessage id="btn.close" defaultMessage="Close" />
          </button>
        </div>
      )}
    </Dialog>
  )
}

export default ErrorDialog
