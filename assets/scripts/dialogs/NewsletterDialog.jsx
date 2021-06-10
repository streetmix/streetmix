import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useForm } from 'react-hook-form'
import Dialog from './Dialog'
import './NewsletterDialog.scss'

function jsonToFormBody (data) {
  const formBody = []
  for (const property in data) {
    const encodedKey = encodeURIComponent(property)
    const encodedValue = encodeURIComponent(data[property])
    formBody.push(encodedKey + '=' + encodedValue)
  }
  return formBody.join('&')
}

const NewsletterDialog = (props) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()
  const [submitState, setSubmitState] = useState('DEFAULT')

  const onSubmit = async (data) => {
    setSubmitState('PENDING')
    const formBody = jsonToFormBody(data)
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
  }

  let submitDisplay
  switch (submitState) {
    case 'PENDING':
      submitDisplay = 'Loading...'
      break
    case 'OK':
      submitDisplay =
        'Thank you! You’re almost subscribed. We’ve sent you an email to confirm your address. Click it and you’re in!'
      break
    case 'ERROR':
      submitDisplay =
        'Uh oh! Something went wrong with the subscription process. This might be a temporary system error. Please try again later!'
      break
    case 'DEFAULT':
    default:
      submitDisplay = null
      break
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
                We send very occasional email updates through our newsletter,
                about once a quarter. Sign up to ensure you won’t miss a thing!
              </p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="bd-email">Enter your email</label>
                <input
                  type="email"
                  name="email"
                  id="bd-email"
                  {...register('email', { required: true })}
                />
                {errors.email && (
                  <span className="subscribe-error">
                    This field is required
                  </span>
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
                <input type="submit" value="Subscribe" />
              </form>
              {submitDisplay}
            </div>
          </div>
        )
      }}
    </Dialog>
  )
}

export default React.memo(NewsletterDialog)
