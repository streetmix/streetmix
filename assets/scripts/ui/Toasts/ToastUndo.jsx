import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import Toast from './Toast'
import { handleUndo } from '../../store/actions/undo'

// Renders a specific type of Toast with Undo button.
ToastUndo.propTypes = {
  item: PropTypes.shape({
    component: PropTypes.oneOf(['TOAST_UNDO']),
    message: PropTypes.string.isRequired,
    action: PropTypes.string,
    handleAction: PropTypes.func
  }),
  setRef: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired
}

function ToastUndo (props) {
  const { item, setRef, handleClose } = props
  const dispatch = useDispatch()
  const intl = useIntl()

  // As per issue #306.
  // The "undo" button always undoes the last action. If this toast
  // is still visible, and a user makes additional edits to the street,
  // the undo button will revert the last edit, not the action that
  // triggered this toast. The solution is to hide this toast whenever
  // another edit is made, which in this case will be based on listening
  // for the event that is fired when the street is updated and saved.
  useEffect(() => {
    window.addEventListener('stmx:save_street', handleClose)

    return () => {
      window.removeEventListener('stmx:save_street', handleClose)
    }
  })

  item.action =
    item.action ||
    intl.formatMessage({
      id: 'btn.undo',
      defaultMessage: 'Undo'
    })

  item.handleAction = (event) => {
    dispatch(handleUndo())
    handleClose(event)
  }

  return <Toast setRef={setRef} handleClose={handleClose} item={item} />
}

export default ToastUndo
