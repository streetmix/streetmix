import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import Dialog from './Dialog'
import ExternalLink from '../ui/ExternalLink'
import './ErrorDialog.scss'

/**
 * The error dialog is displayed in place of another dialog if something goes wrong
 * in the other dialog. It requires a special "reset" function to be passed in as a prop
 * from the parent <DialogRoot /> component, which resets <DialogRoot />'s error state.
 * (Otherwise, this dialog could never be closed.)
 *
 * If _this_ component throws an error, the universe blows up.
 */
ErrorDialog.propTypes = {
  reset: PropTypes.func.isRequired
}

function ErrorDialog (props) {
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
                  a: (chunks) => (
                    <ExternalLink href="https://github.com/streetmix/streetmix/issues/new">
                      {chunks}
                    </ExternalLink>
                  )
                }}
              />
            </p>
          </div>
          <button
            className="dialog-primary-action"
            onClick={() => {
              props.reset()
              closeDialog()
            }}
          >
            <FormattedMessage id="btn.close" defaultMessage="Close" />
          </button>
        </div>
      )}
    </Dialog>
  )
}

export default ErrorDialog
