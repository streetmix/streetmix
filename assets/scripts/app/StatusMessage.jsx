import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { hideStatusMessage } from './status_message'
import { registerKeypress, deregisterKeypress } from './keypress'
import { undo } from '../streets/undo_stack'
import { loseAnyFocus } from './focus'

const STATUS_MESSAGE_HIDE_DELAY = 15000

// TODO: Some logic needs to separate out as container vs presentational.
class StatusMessage extends React.PureComponent {
  constructor (props) {
    super(props)

    this.timerId = -1
  }

  componentDidMount () {
    // As per issue #306.
    window.addEventListener('stmx:save_street', hideStatusMessage)
  }

  componentDidUpdate (prevProps) {
    // Any update resets the visibility timer
    window.clearTimeout(this.timerId)

    // Whenever visibility is set to true, start the timer to auto-hide this
    if (this.props.visible === true) {
      this.timerId = window.setTimeout(hideStatusMessage, STATUS_MESSAGE_HIDE_DELAY)
    }

    // Whenever the visibility state flips, set up or tear down a keypress
    // listener to show/hide the status message.
    if (prevProps.visible === false && this.props.visible === true) {
      registerKeypress('esc', hideStatusMessage)
    } else if (prevProps.visible === true && this.props.visible === false) {
      deregisterKeypress('esc', hideStatusMessage)
    }
  }

  onClickUndo (event) {
    undo()
  }

  onClickTheX (event) {
    hideStatusMessage()

    // Force window to refocus on document.body after StatusMessage is closed by X button
    // Required on Chrome
    window.setTimeout(loseAnyFocus, 0)
  }

  render () {
    const { visible, message, undo } = this.props
    let className = 'status-message'

    if (visible === true) {
      className += ' visible'
    }

    // Some messages contain inline HTML.
    // TODO: refactor this out.
    const html = {
      __html: message
    }

    // Create an undo button if requested.
    const undoButton = (undo)
      ? <button onClick={this.onClickUndo}>Undo</button>
      : null

    return (
      <div id='status-message' className={className}>
        <div className='status-message-content'>
          <span dangerouslySetInnerHTML={html} />
          {undoButton}
          <button className='close' onClick={this.onClickTheX}>×</button>
        </div>
      </div>
    )
  }
}

StatusMessage.propTypes = {
  visible: PropTypes.bool.isRequired,
  message: PropTypes.string,
  undo: PropTypes.bool
}

StatusMessage.defaultProps = {
  visible: false,
  message: '',
  undo: false
}

function mapStateToProps (state) {
  return {
    visible: state.status.showMessage,
    message: state.status.message,
    undo: state.status.undoButton
  }
}

export default connect(mapStateToProps)(StatusMessage)
