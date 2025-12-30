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

  return (
    <TooltipGroup>
      <Tooltip
        label={intl.formatMessage({ id: 'btn.undo', defaultMessage: 'Undo' })}
      >
        <Button
          onClick={() => {
            dispatch(handleUndo())
          }}
          disabled={!isUndoAvailable()}
          data-testid="undo"
        >
          <Icon name="undo" />
        </Button>
      </Tooltip>
      <Tooltip
        label={intl.formatMessage({ id: 'btn.redo', defaultMessage: 'Redo' })}
      >
        <Button
          onClick={() => {
            dispatch(handleRedo())
          }}
          disabled={!isRedoAvailable()}
          data-testid="redo"
        >
          <Icon name="redo" />
        </Button>
      </Tooltip>
    </TooltipGroup>
  )
}
