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
import CloseButton from '../ui/CloseButton'
import { clearDialogs } from '../store/actions/dialogs'
import { registerKeypress, deregisterKeypress } from '../app/keypress'

export class Dialog extends React.Component {
  static propTypes = {
    closeDialog: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired
  }

  componentDidMount () {
    // Set up keypress listener to close dialogs if open
    registerKeypress('esc', this.props.closeDialog)
  }

  componentWillUnmount () {
    deregisterKeypress('esc', this.props.closeDialog)
  }

  handleClickBackdrop = () => {
    this.props.closeDialog()
  }

  render () {
    return (
      <div className="dialog-box-container">
        <div className="dialog-box-backdrop" onClick={this.handleClickBackdrop} />
        <div className="dialog-box" role="dialog">
          <CloseButton onClick={this.props.closeDialog} />
          {this.props.children(this.props.closeDialog)}
        </div>
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
