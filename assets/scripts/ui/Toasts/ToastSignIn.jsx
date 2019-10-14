import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import Toast from './Toast'
import { doSignIn } from '../../users/authentication'

// Renders a specific type of Toast with Sign in button.
ToastSignIn.propTypes = {
  item: PropTypes.shape({
    component: PropTypes.oneOf['TOAST_SIGN_IN'],
    message: PropTypes.string.isRequired,
    action: PropTypes.string,
    handleAction: PropTypes.func
  }),
  setRef: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired
}

function ToastSignIn (props) {
  const { item, setRef, handleClose } = props
  const intl = useIntl()

  item.action = intl.formatMessage({
    id: 'menu.item.sign-in',
    defaultMessage: 'Sign in'
  })

  item.handleAction = (event) => {
    doSignIn()
    handleClose(event)
  }

  return (
    <Toast setRef={setRef} handleClose={handleClose} item={item} />
  )
}

export default ToastSignIn
