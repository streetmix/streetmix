import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'
import Dialog from './Dialog'
import './NewsletterDialog.scss'

/**
 * Converts a JavaScript object of key-value pairs (which is the format of
 * a given payload from react-hook-form's `handleSubmit()`) into a string
 * that would normally be submitted by a form to an endpoint that expects
 * a 'application/x-www-form-urlencoded' MIME-type. This function is generic
 * and can be ported to a common utility module if we ever need it in more
 * than one place.
 *
 * @param {Object} data - provided by react-hook-form's `handleSubmit()`
 * @returns {string} - data expected by the newsletter POST endpoint
 */
function jsObjectToFormBody (data) {
  const formBody = []
  for (const property in data) {
    const encodedKey = encodeURIComponent(property)
    const encodedValue = encodeURIComponent(data[property])
    formBody.push(encodedKey + '=' + encodedValue)
  }
  return formBody.join('&')
}

const NewsletterDialog = (props) => {
  const { formatMessage } = useIntl()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    shouldUseNativeValidation: true
  })
  const [submitState, setSubmitState] = useState('DEFAULT')

  const onSubmit = async (data) => {
    setSubmitState('PENDING')
    const formBody = jsObjectToFormBody(data)

    try {
      const res = await window.fetch(
        'https://buttondown.email/api/emails/embed-subscribe/streetmix',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formBody
        }
      )

      if (res.status === 200) {
        setSubmitState('OK')
      } else {
        // Errors are generic for now.
        setSubmitState('ERROR')
      }
    } catch (err) {
      // The error handling in the try block handles failures on the remote
      // server (e.g. 404, 500, etc). The error handling in the catch block
      // handles failures if the fetch fails on the client side (e.g. user is
      // offline). Both situations will display the same generic error for now.
      setSubmitState('ERROR')
    }
  }

  return (
    <Dialog>
      {(closeDialog) => {
        return (
          <div className="newsletter-dialog">
            <header>
              <h1>
                <FormattedMessage
                  id="dialogs.newsletter.heading"
                  defaultMessage="Subscribe to our newsletter"
                />
              </h1>
            </header>
            <div className="dialog-content">
              <p>
                <FormattedMessage
                  id="dialogs.newsletter.description"
                  defaultMessage="We send occasional email updates through our newsletter, just several times a year. Sign up to ensure you don’t miss a thing!"
                />
              </p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="bd-email">
                  <FormattedMessage
                    id="dialogs.newsletter.email-label"
                    defaultMessage="Enter your email"
                  />
                </label>
                <input
                  type="email"
                  name="email"
                  id="bd-email"
                  placeholder="test@example.com"
                  className={errors.email ? 'subscribe-input-error' : null}
                  {...register('email', { required: true })}
                />
                {errors.email && (
                  <p className="subscribe-error">
                    <FormattedMessage
                      id="dialogs.newsletter.field-required-error"
                      defaultMessage="This field is required."
                    />
                  </p>
                )}
                <input
                  type="hidden"
                  name="tag"
                  value="via app"
                  {...register('tag')}
                />
                <input
                  type="hidden"
                  name="embed"
                  value="1"
                  {...register('embed')}
                />
                {submitState === 'DEFAULT' && (
                  <div className="subscribe-buttons">
                    <input
                      type="submit"
                      value={formatMessage({
                        id: 'dialogs.newsletter.subscribe',
                        defaultMessage: 'Subscribe'
                      })}
                      className="button-primary"
                    />
                  </div>
                )}
                {submitState === 'PENDING' && (
                  <div className="subscribe-buttons">
                    <button disabled={true}>
                      <FormattedMessage
                        id="dialogs.newsletter.subscribe-pending"
                        defaultMessage="Please wait..."
                      />
                    </button>
                  </div>
                )}
                {submitState === 'OK' && (
                  <>
                    <p>
                      <FormattedMessage
                        id="dialogs.newsletter.ok-message"
                        defaultMessage="<strong>Thank you! You’re almost subscribed.</strong> We’ve sent you an email to confirm your address. Click it and you’re in!"
                        values={{
                          // eslint-disable-next-line react/display-name
                          strong: (chunks) => <strong>{chunks}</strong>
                        }}
                      />
                    </p>
                    <div className="subscribe-buttons">
                      <button onClick={closeDialog}>
                        <FormattedMessage
                          id="btn.close"
                          defaultMessage="Close"
                        />
                      </button>
                    </div>
                  </>
                )}
                {submitState === 'ERROR' && (
                  <>
                    <p className="subscribe-error">
                      <FormattedMessage
                        id="dialogs.newsletter.error-message"
                        defaultMessage="Uh oh! Something went wrong with the subscription process. This might be a temporary system error. Please try again later!"
                      />
                    </p>
                    <div className="subscribe-buttons">
                      {/* Display button for retry, rather than cancel or close */}
                      <input
                        type="submit"
                        value="Subscribe"
                        className="button-primary"
                      />
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )
      }}
    </Dialog>
  )
}

export default React.memo(NewsletterDialog)
