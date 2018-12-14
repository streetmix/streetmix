/**
 * Dialog
 *
 * These things are actually modals, since they block the main window.
 * They're positioned over everything else in the app and will prevent
 * interaction with the rest of the app until it's closed.
 *
 * Clicking on the modal's backdrop will automatically close the modal.
 * We used to have dialogs that prevented this form of closing, but
 * they're not used anymore, so this functionality has been removed.
 * Modals that behave differently from each other is probably not a
 * great idea.
 *
 * Only one modal window is shown at a time. Nested modals aren't supported.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import CloseButton from '../ui/CloseButton'
import { connect } from 'react-redux'
import { clearDialogs } from '../store/actions/dialogs'

export class Dialog extends React.Component {
  static propTypes = {
    closeDialog: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      error: false
    }
  }

  componentDidMount () {
    // Set up keypress listener to close dialogs if open
    registerKeypress('esc', this.props.closeDialog)
  }

  componentWillUnmount () {
    deregisterKeypress('esc', this.props.closeDialog)
  }

  componentDidCatch (error, info) {
    this.setState({
      error
    })
  }

  onClickShield = () => {
    this.props.closeDialog()
  }

  renderErrorDialog = () => {
    return (
      <div className="dialog-box" role="dialog">
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
          <button className="dialog-primary-action" onClick={this.props.closeDialog}>
            <FormattedMessage id="btn.close" defaultMessage="Close" />
          </button>
        </div>
      </div>
    )
  }

  render () {
    let shieldClassName = 'dialog-box-shield'

    return (
      <div className="dialog-box-container">
        <div className={shieldClassName} onClick={this.onClickShield} />

        {this.state.error ? this.renderErrorDialog() : (
          <div className="dialog-box" role="dialog">
            <CloseButton onClick={this.props.closeDialog} />
            {this.props.children(this.props.closeDialog)}
          </div>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    closeDialog: () => { dispatch(clearDialogs()) }
  }
}

export default connect(null, mapDispatchToProps)(Dialog)
