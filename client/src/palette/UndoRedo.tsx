import { useIntl } from 'react-intl'

import { useSelector, useDispatch } from '../store/hooks.js'
import { handleUndo, handleRedo } from '../store/actions/history.js'
import { Button } from '../ui/Button.js'
import Icon from '../ui/Icon.js'
import { Tooltip, TooltipGroup } from '../ui/Tooltip.js'
import { isOwnedByCurrentUser } from '../streets/owner.js'

export function UndoRedo() {
  const undoPosition = useSelector((state) => state.history.position)
  const undoStack = useSelector((state) => state.history.stack)
  const dispatch = useDispatch()
  const intl = useIntl()

  // Don’t allow undo/redo unless you own the street
  function isUndoAvailable(): boolean {
    return undoPosition > 0 && isOwnedByCurrentUser()
  }

  function isRedoAvailable(): boolean {
    return (
      undoPosition >= 0 &&
      undoPosition < undoStack.length - 1 &&
      isOwnedByCurrentUser()
    )
  }

  const undoLabel = intl.formatMessage({
    id: 'btn.undo',
    defaultMessage: 'Undo',
  })
  const redoLabel = intl.formatMessage({
    id: 'btn.redo',
    defaultMessage: 'Redo',
  })

  return (
    <TooltipGroup>
      <Tooltip label={undoLabel}>
        <Button
          onClick={() => {
            dispatch(handleUndo())
          }}
          disabled={!isUndoAvailable()}
          aria-label={undoLabel}
        >
          <Icon name="undo" />
        </Button>
      </Tooltip>
      <Tooltip label={redoLabel}>
        <Button
          onClick={() => {
            dispatch(handleRedo())
          }}
          disabled={!isRedoAvailable()}
          aria-label={redoLabel}
        >
          <Icon name="redo" />
        </Button>
      </Tooltip>
    </TooltipGroup>
  )
}
