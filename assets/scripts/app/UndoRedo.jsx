import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
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

  shouldComponentUpdate (nextProps) {
    return nextProps.undoPosition !== this.props.undoPosition || nextProps.undoStack !== this.props.undoStack
  }

  render () {
    return (
      <React.Fragment>
        <button
          onClick={this.props.undo}
          disabled={!isUndoAvailable()}
          title={this.props.intl.formatMessage({ id: 'btn.undo', defaultMessage: 'Undo' })}
        >
          <FontAwesomeIcon icon="undo" />
        </button>
        <button
          onClick={this.props.redo}
          disabled={!isRedoAvailable()}
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

const mapDispatchToProps = {
  undo,
  redo
}

export default connect(mapStateToProps, mapDispatchToProps)(UndoRedoWithIntl)
