import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_UNDO, ICON_REDO } from '../ui/icons'
import { getRemixOnFirstEdit } from '../streets/remix'
import { undo, redo } from '../store/actions/undo'

const UndoRedo = (props) => {
  const intl = useIntl()

  // Don’t allow undo/redo unless you own the street
  // TODO: We need a better function name than `getRemixOnFirstEdit`
  function isUndoAvailable () {
    return (props.undoPosition > 0) && !getRemixOnFirstEdit()
  }

  function isRedoAvailable () {
    return (props.undoPosition >= 0 && props.undoPosition < props.undoStack.length - 1) && !getRemixOnFirstEdit()
  }

  return (
    <>
      <button
        onClick={props.undo}
        disabled={!isUndoAvailable()}
        title={intl.formatMessage({ id: 'btn.undo', defaultMessage: 'Undo' })}
      >
        <FontAwesomeIcon icon={ICON_UNDO} />
      </button>
      <button
        onClick={props.redo}
        disabled={!isRedoAvailable()}
        title={intl.formatMessage({ id: 'btn.redo', defaultMessage: 'Redo' })}
      >
        <FontAwesomeIcon icon={ICON_REDO} />
      </button>
    </>
  )
}

UndoRedo.propTypes = {
  undoPosition: PropTypes.number.isRequired,
  undoStack: PropTypes.array.isRequired,
  undo: PropTypes.func.isRequired,
  redo: PropTypes.func.isRequired
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
