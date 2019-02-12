import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_UNDO, ICON_REDO } from '../ui/icons'
import { undo, redo } from '../store/actions/undo'
import { isUndoAvailable, isRedoAvailable } from '../streets/undo_stack'

export class UndoRedo extends React.Component {
  static propTypes = {
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
        <FormattedMessage id="btn.undo" defaultMessage="Undo">
          {(title) => (
            <button
              onClick={this.props.undo}
              disabled={!isUndoAvailable()}
              title={title}
            >
              <FontAwesomeIcon icon={ICON_UNDO} />
            </button>
          )}
        </FormattedMessage>
        <FormattedMessage id="btn.redo" defaultMessage="Redo">
          {(title) => (
            <button
              onClick={this.props.redo}
              disabled={!isRedoAvailable()}
              title={title}
            >
              <FontAwesomeIcon icon={ICON_REDO} />
            </button>
          )}
        </FormattedMessage>
      </React.Fragment>
    )
  }
}

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

export default connect(mapStateToProps, mapDispatchToProps)(UndoRedo)
