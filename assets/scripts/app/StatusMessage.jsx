import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { hideStatusMessage } from './status_message'
import { undo } from '../streets/undo_stack'
import { loseAnyFocus } from './focus'

class StatusMessage extends React.PureComponent {
  constructor (props) {
    super(props)

    this.onClickUndo = this.onClickUndo.bind(this)
  }

  onClickUndo (event) {
    undo()
  }

  onClickTheX (event) {
    hideStatusMessage()

    // Force window to refocus on document.body after status-message is closed by X button
    // Required on Chrome
    window.setTimeout(function () {
      loseAnyFocus()
    }, 0)
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
    let undoButton = null
    if (undo) {
      undoButton = <button onClick={this.onClickUndo}>Undo</button>
    }

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
