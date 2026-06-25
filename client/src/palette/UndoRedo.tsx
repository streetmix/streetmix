import { useIntl } from 'react-intl'

import { useSelector, useDispatch } from '../store/hooks.js'
import { handleUndo, handleRedo } from '../store/actions/history.js'
import { Button } from '../ui/Button.js'
import { Icon } from '../ui/Icon.js'
import { Tooltip, TooltipGroup } from '../ui/Tooltip.js'
import { isUndoAvailable, isRedoAvailable } from '../streets/undo_stack.js'

export function UndoRedo() {
  const canUndo = useSelector(isUndoAvailable)
  const canRedo = useSelector(isRedoAvailable)
  const dispatch = useDispatch()
  const intl = useIntl()

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
      <Tooltip label={undoLabel} role="label">
        <Button
          onClick={() => {
            dispatch(handleUndo())
          }}
          disabled={!canUndo}
          aria-label={undoLabel}
        >
          <Icon name="undo" size="24" />
        </Button>
      </Tooltip>
      <Tooltip label={redoLabel} role="label">
        <Button
          onClick={() => {
            dispatch(handleRedo())
          }}
          disabled={!canRedo}
          aria-label={redoLabel}
        >
          <Icon name="redo" size="24" />
        </Button>
      </Tooltip>
    </TooltipGroup>
  )
}
