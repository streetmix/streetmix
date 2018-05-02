import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { FormattedMessage } from 'react-intl'

import { hideStatusMessage } from '../store/actions/status'
import { registerKeypress, deregisterKeypress } from './keypress'
import { URL_SIGN_IN_REDIRECT } from './routing'
import { undo } from '../streets/undo_stack'
import { loseAnyFocus } from '../util/focus'
import CloseButton from '../ui/CloseButton'

const STATUS_MESSAGE_HIDE_DELAY = 15000

// TODO: Some logic needs to separate out as container vs presentational.
class StatusMessage extends React.PureComponent {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    message: PropTypes.string,
    undo: PropTypes.bool,
    signIn: PropTypes.bool,
    hideStatusMessage: PropTypes.func
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

  onClickUndo = (event) => {
    undo()
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
      className += ' visible'
    }

    // Create an undo button if requested.
    // Translation of "undo" is reused from the undo palette.
    const undoButton = (undo)
      ? (
        <button onClick={this.onClickUndo}>
          <FormattedMessage id="btn.undo" defaultMessage="Undo" />
        </button>
      ) : null

    // Create a sign-in button if requested.
    // Translation of "sign in" is reused from the menu bar.
    const signInButton = (signIn)
      ? (
        <a href={`/${URL_SIGN_IN_REDIRECT}`} className="button-like">
          <FormattedMessage id="menu.item.sign-in" defaultMessage="Sign in" />
        </a>
      ) : null

    return (
      <div id="status-message" className={className}>
        <div className="status-message-content">
          {message}
          {undoButton}
          {signInButton}
          <CloseButton onClick={this.onClickTheX} />
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
  return bindActionCreators({ hideStatusMessage }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusMessage)
