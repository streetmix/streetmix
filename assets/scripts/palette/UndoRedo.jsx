import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_UNDO, ICON_REDO } from '../ui/icons'
import { isOwnedByCurrentUser } from '../streets/owner'
import { handleUndo, handleRedo } from '../store/actions/undo'

function UndoRedo (props) {
  const undoPosition = useSelector((state) => state.undo.position)
  const undoStack = useSelector((state) => state.undo.stack)
  const dispatch = useDispatch()
  const intl = useIntl()

  // Don’t allow undo/redo unless you own the street
  function isUndoAvailable () {
    return undoPosition > 0 && isOwnedByCurrentUser()
  }

  function isRedoAvailable () {
    return (
      undoPosition >= 0 &&
      undoPosition < undoStack.length - 1 &&
      isOwnedByCurrentUser()
    )
  }

  return (
    <>
      <button
        onClick={() => dispatch(handleUndo())}
        disabled={!isUndoAvailable()}
        title={intl.formatMessage({ id: 'btn.undo', defaultMessage: 'Undo' })}
      >
        <FontAwesomeIcon icon={ICON_UNDO} />
      </button>
      <button
        onClick={() => dispatch(handleRedo())}
        disabled={!isRedoAvailable()}
        title={intl.formatMessage({ id: 'btn.redo', defaultMessage: 'Redo' })}
      >
        <FontAwesomeIcon icon={ICON_REDO} />
      </button>
    </>
  )
}

export default React.memo(UndoRedo)
