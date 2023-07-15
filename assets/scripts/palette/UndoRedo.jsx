import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '../ui/Button'
import Tooltip, { useSingleton } from '../ui/Tooltip'
import { ICON_UNDO, ICON_REDO } from '../ui/icons'
import { isOwnedByCurrentUser } from '../streets/owner'
import { handleUndo, handleRedo } from '../store/actions/history'

function UndoRedo (props) {
  const undoPosition = useSelector((state) => state.history.position)
  const undoStack = useSelector((state) => state.history.stack)
  const [source, target] = useSingleton()
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
      <Tooltip source={source} />
      <Tooltip
        target={target}
        label={intl.formatMessage({ id: 'btn.undo', defaultMessage: 'Undo' })}
      >
        {/* Keep title on button to be queryable by test */}
        <Button
          onClick={() => dispatch(handleUndo())}
          disabled={!isUndoAvailable()}
          title={intl.formatMessage({ id: 'btn.undo', defaultMessage: 'Undo' })}
        >
          <FontAwesomeIcon icon={ICON_UNDO} />
        </Button>
      </Tooltip>
      <Tooltip
        target={target}
        label={intl.formatMessage({ id: 'btn.redo', defaultMessage: 'Redo' })}
      >
        {/* Keep title on button to be queryable by test */}
        <Button
          onClick={() => dispatch(handleRedo())}
          disabled={!isRedoAvailable()}
          title={intl.formatMessage({ id: 'btn.redo', defaultMessage: 'Redo' })}
        >
          <FontAwesomeIcon icon={ICON_REDO} />
        </Button>
      </Tooltip>
    </>
  )
}

export default React.memo(UndoRedo)
