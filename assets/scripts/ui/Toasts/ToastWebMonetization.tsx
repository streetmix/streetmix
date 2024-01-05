import React, { useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useSelector } from '../../store/hooks'
import { doSignIn } from '../../users/authentication'
import wmIcon from '../../../images/wm-icon-animated.svg'
import ExternalLink from '../ExternalLink'
import Toast, { type ToastItemProps, type ToastProps } from './Toast'
import './ToastWebMonetization.scss'

// Renders a specific type of Toast for Web Monetized users that are not signed in.
interface ToastWebMonetizationProps extends ToastProps {
  item: ToastItemProps & {
    component: 'TOAST_WEB_MONETIZATION'
  }
}

function ToastWebMonetization (
  props: ToastWebMonetizationProps
): React.ReactNode {
  const { item, setRef, handleClose } = props
  const signedIn = useSelector((state) => state.user.signedIn)
  const intl = useIntl()

  // It's possible to encounter a race condition where a user's signed-in
  // state becomes `true` after this toast has already displayed. If that
  // happens, this automatically closes the toast.
  useEffect(() => {
    if (signedIn) {
      handleClose()
    }
  }, [signedIn, handleClose])

  // Monetization can stop in certain cases, such as when a user switches
  // to another tab. In that event, close the toast.
  useEffect(() => {
    if (document.monetization !== undefined) {
      document.monetization.addEventListener('monetizationstop', handleClose)
    }

    return () => {
      if (document.monetization !== undefined) {
        document.monetization.removeEventListener(
          'monetizationstop',
          handleClose
        )
      }
    }
  })

  function handleAction (event: React.MouseEvent): void {
    doSignIn()
    handleClose(event)
  }

  return (
    <Toast
      setRef={setRef}
      handleClose={handleClose}
      handleAction={handleAction}
      className="toast-web-monetization"
      item={{
        ...item,
        mode: 'success',
        action: intl.formatMessage({
          id: 'menu.item.sign-in',
          defaultMessage: 'Sign in'
        })
      }}
    >
      <div className="toast-icon-header">
        <img src={wmIcon} alt="Web Monetization icon" className="wm-icon" />
        <h3>
          <FormattedMessage
            id="plus.web-monetization.thanks"
            defaultMessage="Thanks for your support!&lrm;"
          />
        </h3>
      </div>
      <p>
        <FormattedMessage
          id="plus.web-monetization.not-signed-in"
          defaultMessage="Your browser is sending Web Monetization payments. Sign in now to access your Streetmix+ benefits!&lrm;"
        />
      </p>
      <p>
        <strong>Deprecation warning:</strong> The Coil plugin has been
        discontinued since February 2, 2023. We encourage all Coil plugin users
        to migrate to another service for Streetmix+ benefits.
        <ExternalLink href="https://strt.mx/plus#coil">
          Learn more.
        </ExternalLink>
      </p>
    </Toast>
  )
}

export default ToastWebMonetization
