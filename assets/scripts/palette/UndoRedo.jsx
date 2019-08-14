import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_UNDO, ICON_REDO } from '../ui/icons'
import { undo, redo } from '../store/actions/undo'
import { isUndoAvailable, isRedoAvailable } from '../streets/undo_stack'

const UndoRedo = (props) => {
  const intl = useIntl()

  return (
    <>
      <button
        onClick={props.undo}
        disabled={!isUndoAvailable()}
        title={intl.formatHTMLMessage({ id: 'btn.undo', defaultMessage: 'Undo' })}
      >
        <FontAwesomeIcon icon={ICON_UNDO} />
      </button>
      <button
        onClick={props.redo}
        disabled={!isRedoAvailable()}
        title={intl.formatHTMLMessage({ id: 'btn.redo', defaultMessage: 'Redo' })}
      >
        <FontAwesomeIcon icon={ICON_REDO} />
      </button>
    </>
  )
}

UndoRedo.propTypes = {
  undo: PropTypes.func,
  redo: PropTypes.func
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
