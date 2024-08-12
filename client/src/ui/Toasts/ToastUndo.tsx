import React from 'react'
import { useIntl } from 'react-intl'

import { useDispatch } from '../../store/hooks'
import { handleUndo } from '../../store/actions/history'
import Toast, { type ToastProps } from './Toast'

// Renders a specific type of Toast with Undo button.
function ToastUndo (props: ToastProps): React.ReactElement {
  const { item, setRef, handleClose } = props
  const dispatch = useDispatch()
  const intl = useIntl()

  // TODO: Restore functionality describes in issue #306.
  // The "undo" button always undoes the last action. If this toast
  // is still visible, and a user makes additional edits to the street,
  // the undo button will revert the last edit, not the action that
  // triggered this toast.
  // A previous solution was to hide this toast when the street is
  // updated and saved, but this has been broken in the react-spring toast
  // implementation for some time.
  // A new solution is to know which undo step triggered the toast,
  // and if the undo action is still relevant, it is performed when clicked.
  // Otherwise the undo action is rendered inert.
  // We can't do this right now because undos don't have an ID to key off of.

  function handleAction (event: React.MouseEvent): void {
    void dispatch(handleUndo())
    handleClose(event)
  }

  return (
    <Toast
      setRef={setRef}
      handleClose={handleClose}
      handleAction={handleAction}
      item={{
        ...item,
        action:
          item.action ??
          intl.formatMessage({
            id: 'btn.undo',
            defaultMessage: 'Undo'
          })
      }}
    />
  )
}

export default ToastUndo
