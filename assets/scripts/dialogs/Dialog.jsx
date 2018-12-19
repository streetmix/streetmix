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
import { connect } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import CloseButton from '../ui/CloseButton'
import { clearDialogs } from '../store/actions/dialogs'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import './Dialog.scss'

export class Dialog extends React.Component {
  static propTypes = {
    clearDialogs: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired
  }

  // Appear state controls transition in/out
  state = {
    appear: true
  }

  componentDidMount () {
    // Set up keypress listener to close dialogs if open
    registerKeypress('esc', this.handleClose)
  }

  componentWillUnmount () {
    deregisterKeypress('esc', this.handleClose)
  }

  handleClose = () => {
    this.setState({
      appear: false
    })
  }

  render () {
    return (
      <CSSTransition
        appear
        in={this.state.appear}
        timeout={80}
        classNames="dialog-transition"
        onExited={this.props.clearDialogs}
      >
        <div className="dialog-box-container">
          <div className="dialog-box-backdrop" onClick={this.handleClose} />
          <div className="dialog-box" role="dialog">
            <CloseButton onClick={this.handleClose} />
            {this.props.children(this.handleClose)}
          </div>
        </div>
      </CSSTransition>
    )
  }
}

export default connect(null, { clearDialogs })(Dialog)
