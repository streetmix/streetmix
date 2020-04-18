import React from 'react'
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

  item.action = intl.formatMessage({
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
