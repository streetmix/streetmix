import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { undo, redo } from '../store/actions/undo'
import { isUndoAvailable, isRedoAvailable } from '../streets/undo_stack'

class UndoRedo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    undoPosition: PropTypes.number,
    undoStack: PropTypes.array,
    undo: PropTypes.func,
    redo: PropTypes.func
  }

  constructor (props) {
    super(props)

    // Undo/redo availability is always checked. This makes sure that
    // component is always in the correct state even after re-mounting,
    // e.g. when locale has changed.
    this.state = {
      undoAvailable: isUndoAvailable(),
      redoAvailable: isRedoAvailable()
    }
  }

  componentWillReceiveProps (nextProps) {
    // Update undo or redo buttons if the undo position or stack has changed.
    if (this.props.undoPosition !== nextProps.undoPosition || this.props.undoStack !== nextProps.undoStack) {
      this.setState({
        undoAvailable: isUndoAvailable(),
        redoAvailable: isRedoAvailable()
      })
    }
  }

  render () {
    return (
      <React.Fragment>
        <button
          onClick={this.props.undo}
          disabled={!this.state.undoAvailable}
          title={this.props.intl.formatMessage({ id: 'btn.undo', defaultMessage: 'Undo' })}
        >
          <FontAwesomeIcon icon="undo" />
        </button>
        <button
          onClick={this.props.redo}
          disabled={!this.state.redoAvailable}
          title={this.props.intl.formatMessage({ id: 'btn.redo', defaultMessage: 'Redo' })}
        >
          <FontAwesomeIcon icon="redo" />
        </button>
      </React.Fragment>
    )
  }
}

// Inject Intl via a higher-order component provided by react-intl.
// Exported so that this component can be tested.
export const UndoRedoWithIntl = injectIntl(UndoRedo)

function mapStateToProps (state) {
  return {
    undoPosition: state.undo.position,
    undoStack: state.undo.stack
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ undo, redo }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(UndoRedoWithIntl)
