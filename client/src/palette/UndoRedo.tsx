import React from 'react'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector, useDispatch } from '../store/hooks'
import { handleUndo, handleRedo } from '../store/actions/history'
import Button from '../ui/Button'
import Tooltip, { useSingleton } from '../ui/Tooltip'
import { ICON_UNDO, ICON_REDO } from '../ui/icons'
import { isOwnedByCurrentUser } from '../streets/owner'

function UndoRedo (): React.ReactElement {
  const undoPosition = useSelector((state) => state.history.position)
  const undoStack = useSelector((state) => state.history.stack)
  const [source, target] = useSingleton()
  const dispatch = useDispatch()
  const intl = useIntl()

  // Don’t allow undo/redo unless you own the street
  function isUndoAvailable (): boolean {
    return undoPosition > 0 && isOwnedByCurrentUser()
  }

  function isRedoAvailable (): boolean {
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
          onClick={() => {
            void dispatch(handleUndo())
          }}
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
          onClick={() => {
            void dispatch(handleRedo())
          }}
          disabled={!isRedoAvailable()}
          title={intl.formatMessage({ id: 'btn.redo', defaultMessage: 'Redo' })}
        >
          <FontAwesomeIcon icon={ICON_REDO} />
        </Button>
      </Tooltip>
    </>
  )
}

export default UndoRedo
