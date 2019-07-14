import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { FormattedMessage } from 'react-intl'

import { doSignIn } from '../users/authentication'
import { hideStatusMessage } from '../store/actions/status'
import { undo as doUndo } from '../store/actions/undo'
import { registerKeypress, deregisterKeypress } from './keypress'
import { loseAnyFocus } from '../util/focus'
import CloseButton from '../ui/CloseButton'
import './StatusMessage.scss'

const STATUS_MESSAGE_HIDE_DELAY = 15000

// TODO: Some logic needs to separate out as container vs presentational.
class StatusMessage extends React.PureComponent {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    message: PropTypes.string,
    undo: PropTypes.bool,
    signIn: PropTypes.bool,
    hideStatusMessage: PropTypes.func,
    doUndo: PropTypes.func
  }

  static defaultProps = {
    visible: false,
    message: '',
    undo: false,
    signIn: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.timerId = -1
  }

  componentDidMount () {
    // As per issue #306.
    window.addEventListener('stmx:save_street', this.props.hideStatusMessage)
  }

  componentDidUpdate (prevProps) {
    // Any update resets the visibility timer
    window.clearTimeout(this.timerId)

    // Whenever visibility is set to true, start the timer to auto-hide this
    if (this.props.visible === true) {
      this.timerId = window.setTimeout(this.props.hideStatusMessage, STATUS_MESSAGE_HIDE_DELAY)
    }

    // Whenever the visibility state flips, set up or tear down a keypress
    // listener to show/hide the status message.
    if (prevProps.visible === false && this.props.visible === true) {
      registerKeypress('esc', this.props.hideStatusMessage)
    } else if (prevProps.visible === true && this.props.visible === false) {
      deregisterKeypress('esc', this.props.hideStatusMessage)
    }
  }

  componentWillUnmount () {
    window.removeEventListener('stmx:save_street', this.props.hideStatusMessage)
  }

  onClickUndo = (event) => {
    this.props.doUndo()
  }

  onClickTheX = (event) => {
    this.props.hideStatusMessage()

    // Force window to refocus on document.body after StatusMessage is closed by X button
    // Required on Chrome
    window.setTimeout(loseAnyFocus, 0)
  }

  render () {
    const { visible, message, undo, signIn } = this.props
    let className = 'status-message'

    if (visible === true) {
      className += ' status-message-visible'
    }

    // Create an undo button if requested.
    // Translation of "undo" is reused from the undo palette.
    const UndoButton = (undo) && (
      <button onClick={this.onClickUndo}>
        <FormattedMessage id="btn.undo" defaultMessage="Undo" />
      </button>
    )

    // Create a sign-in button if requested.
    // Translation of "sign in" is reused from the menu bar.
    const SignInButton = (signIn) && (
      <button onClick={doSignIn}>
        <FormattedMessage id="menu.item.sign-in" defaultMessage="Sign in" />
      </button>
    )

    return (
      <div id="status-message" className={className}>
        <div className="status-message-content">
          {message}
          {UndoButton}
          {SignInButton}
          {/* Do not focus the close button when offscreen */}
          <CloseButton onClick={this.onClickTheX} tabIndex={visible ? 0 : -1} />
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    visible: state.status.showMessage,
    message: state.status.message,
    undo: state.status.undoButton,
    signIn: state.status.signInButton
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ hideStatusMessage, doUndo }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusMessage)
