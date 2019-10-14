import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import Toast from './Toast'
import { nonblockingAjaxTryAgain } from '../../util/fetch_nonblocking'

// Renders a specific type of Toast with Undo button.
ToastNoConnection.propTypes = {
  item: PropTypes.shape({
    component: PropTypes.oneOf['TOAST_UNDO'],
    message: PropTypes.string.isRequired,
    action: PropTypes.string,
    handleAction: PropTypes.func
  }),
  setRef: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired
}

function ToastNoConnection (props) {
  const { item, setRef, handleClose } = props
  const intl = useIntl()

  item.action = intl.formatMessage({
    id: 'btn.try-again',
    defaultMessage: 'Try again'
  })

  item.handleAction = (event) => {
    nonblockingAjaxTryAgain()
    handleClose(event)
  }

  return (
    <Toast setRef={setRef} handleClose={handleClose} item={item} />
  )
}

export default ToastNoConnection
