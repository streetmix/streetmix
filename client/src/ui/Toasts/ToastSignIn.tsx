import React from 'react'
import { useIntl } from 'react-intl'

import { doSignIn } from '../../users/authentication'
import Toast, { type ToastProps } from './Toast'

// Renders a specific type of Toast with Sign in button.
function ToastSignIn (props: ToastProps): React.ReactElement {
  const { item, setRef, handleClose } = props
  const intl = useIntl()

  function handleAction (event: React.MouseEvent): void {
    doSignIn()
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
            id: 'menu.item.sign-in',
            defaultMessage: 'Sign in'
          })
      }}
    />
  )
}

export default ToastSignIn
