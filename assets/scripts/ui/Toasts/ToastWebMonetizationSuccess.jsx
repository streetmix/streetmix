import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import wmIcon from '../../../images/wm-icon-animated.svg'
import Toast from './Toast'

// Renders a specific type of Toast for Web Monetized users that are not signed in.
ToastWebMonetizationSuccess.propTypes = {
  item: PropTypes.shape({
    component: PropTypes.oneOf(['TOAST_WEB_MONETIZATION_SUCCESS']),
    action: PropTypes.string
  }),
  setRef: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired
}

function ToastWebMonetizationSuccess (props) {
  const { item, setRef, handleClose } = props
  const intl = useIntl()

  function handleAction (event) {
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
          defaultMessage: 'Learn more'
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
          id="plus.web-monetization.signed-in"
          defaultMessage="Your Web Monetization subscription gives you full access to Streetmix+ features.&lrm;"
        />
      </p>
    </Toast>
  )
}

export default ToastWebMonetizationSuccess
