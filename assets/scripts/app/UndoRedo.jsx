import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { undo, redo, isUndoAvailable, isRedoAvailable } from '../streets/undo_stack'
import { t } from '../app/locale'

class UndoRedo extends React.Component {
  static propTypes = {
    undoPosition: PropTypes.number
  }

  constructor (props) {
    super(props)

    this.state = {
      undo: false,
      redo: false
    }
  }

  componentWillReceiveProps (nextProps) {
    // Update undo or redo buttons if the undo position has changed.
    if (this.props.undoPosition !== nextProps.undoPosition) {
      this.setState({
        undo: isUndoAvailable(),
        redo: isRedoAvailable()
      })
    }
  }

  render () {
    return (
      <React.Fragment>
        <button onClick={undo} disabled={!this.state.undo}>{t('btn.undo', 'Undo')}</button>
        <button onClick={redo} disabled={!this.state.redo}>{t('btn.redo', 'Redo')}</button>
      </React.Fragment>
    )
  }
}

function mapStateToProps (state) {
  return {
    undoPosition: state.undo.position
  }
}

export default connect(mapStateToProps)(UndoRedo)
