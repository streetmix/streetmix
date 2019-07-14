import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import Dialog from './Dialog'
import './ErrorDialog.scss'

/**
 * The error dialog is displayed in place of another dialog if something goes wrong
 * in the other dialog. It requires a special "reset" function to be passed in as a prop
 * from the parent <DialogRoot /> component, which resets <DialogRoot />'s error state.
 * (Otherwise, this dialog could never be closed.)
 *
 * If _this_ component throws an error, the universe blows up.
 */
const ErrorDialog = (props) => (
  <Dialog>
    {(closeDialog) => (
      <div className="dialog-error">
        <header>
          <h1>
            <FormattedMessage id="dialogs.error.heading" defaultMessage="Oops!" />
          </h1>
        </header>
        <div className="dialog-content">
          <p>
            <FormattedHTMLMessage id="dialogs.error.text" defaultMessage="Something unexpected happened 😢, please try again." />
          </p>
        </div>
        <button className="dialog-primary-action" onClick={() => {
          props.reset()
          closeDialog()
        }}>
          <FormattedMessage id="btn.close" defaultMessage="Close" />
        </button>
      </div>
    )}
  </Dialog>
)

ErrorDialog.propTypes = {
  reset: PropTypes.func.isRequired
}

export default ErrorDialog
