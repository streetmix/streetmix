import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import wmIcon from 'url:../../../images/wm-icon-animated.svg'
import { ExternalLink } from '../ExternalLink'
import Toast, { type ToastProps } from './Toast'

// Renders a specific type of Toast for Web Monetized users that are not signed in.
function ToastWebMonetizationSuccess(props: ToastProps): React.ReactElement {
  const { item, setRef, handleClose } = props
  const intl = useIntl()

  function handleAction(event: React.MouseEvent): void {
    window.open(
      'https://docs.streetmix.net/user-guide/streetmix-plus',
      '_blank'
    )
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
          id: 'plus.web-monetization.learn-more',
          defaultMessage: 'Learn more',
        }),
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
          id="plus.web-monetization.signed-in"
          defaultMessage="Your Web Monetization subscription gives you full access to Streetmix+ benefits.&lrm;"
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

export default ToastWebMonetizationSuccess
