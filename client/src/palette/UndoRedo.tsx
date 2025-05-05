import React from 'react'
import { useIntl } from 'react-intl'

import { useSelector, useDispatch } from '../store/hooks'
import { handleUndo, handleRedo } from '../store/actions/history'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import { Tooltip, TooltipGroup } from '../ui/Tooltip'
import { isOwnedByCurrentUser } from '../streets/owner'

function UndoRedo (): React.ReactElement {
  const undoPosition = useSelector((state) => state.history.position)
  const undoStack = useSelector((state) => state.history.stack)
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
    <TooltipGroup>
      <Tooltip
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
          <Icon name="undo" />
        </Button>
      </Tooltip>
      <Tooltip
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
          <Icon name="redo" />
        </Button>
      </Tooltip>
    </TooltipGroup>
  )
}

export default UndoRedo
