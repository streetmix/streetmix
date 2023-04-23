import React from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { handleUndo } from '../../store/actions/undo'
import Toast from './Toast'

function ToastUndo (props) {
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

  function handleAction (event) {
    dispatch(handleUndo())
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
          item.action ||
          intl.formatMessage({
            id: 'btn.undo',
            defaultMessage: 'Undo'
          })
      }}
    />
  )
}

// Renders a specific type of Toast with Undo button.
ToastUndo.propTypes = {
  item: PropTypes.shape({
    component: PropTypes.oneOf(['TOAST_UNDO']),
    message: PropTypes.string.isRequired,
    action: PropTypes.string
  }),
  setRef: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired
}

export default ToastUndo
