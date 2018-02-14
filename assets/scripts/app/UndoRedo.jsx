import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { undo, redo, isUndoAvailable, isRedoAvailable } from '../streets/undo_stack'
import { t } from '../app/locale'

class UndoRedo extends React.Component {
  static propTypes = {
    undo: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      undoAvailable: false,
      redoAvailable: false
    }
  }

  componentWillReceiveProps (nextProps) {
    // Update undo or redo buttons if the undo position or stack has changed.
    if (this.props.undo.position !== nextProps.undo.position || this.props.undo.stack !== nextProps.undo.stack) {
      this.setState({
        undoAvailable: isUndoAvailable(),
        redoAvailable: isRedoAvailable()
      })
    }
  }

  render () {
    return (
      <React.Fragment>
        <button onClick={undo} disabled={!this.state.undoAvailable}>{t('btn.undo', 'Undo')}</button>
        <button onClick={redo} disabled={!this.state.redoAvailable}>{t('btn.redo', 'Redo')}</button>
      </React.Fragment>
    )
  }
}

function mapStateToProps (state) {
  return {
    undo: state.undo
  }
}

export default connect(mapStateToProps)(UndoRedo)
