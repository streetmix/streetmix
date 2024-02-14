import React, { useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import Toast, { type ToastProps } from './Toast'

// Renders a specific type of Toast for no-connection message.
function ToastNoConnection (props: ToastProps): React.ReactElement {
  const { item, setRef, handleClose } = props
  const intl = useIntl()

  // This toast is usually called with a infinite duration (it never
  // closes after a certain amount of time has passsed). It will close
  // if someone interacts with it, but it also needs to close
  // automatically when the connection is restored or re-attempted.
  // This event listener handles that.
  useEffect(() => {
    window.addEventListener('online', handleClose)

    return () => {
      window.removeEventListener('online', handleClose)
    }
  })

  return (
    <Toast
      setRef={setRef}
      handleClose={handleClose}
      handleAction={handleClose}
      item={{
        ...item,
        action:
          item.action ??
          intl.formatMessage({
            id: 'btn.dismiss',
            defaultMessage: 'Dismiss'
          })
      }}
    >
      {/* Handle the message here so it doesn't need to be passed by caller. */}
      <FormattedMessage
        id="msg.no-connection"
        defaultMessage="Streetmix is having trouble connecting to the Internet."
      />
    </Toast>
  )
}

export default ToastNoConnection
