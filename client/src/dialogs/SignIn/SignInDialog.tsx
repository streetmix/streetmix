import React, { useState, useRef, useEffect, useId } from 'react'
import { FormattedMessage } from 'react-intl'

import {
  goEmailSignIn,
  goTwitterSignIn,
  goFacebookSignIn,
  goGoogleSignIn
} from '~/src/app/routing'
import Button from '~/src/ui/Button'
import Icon from '~/src/ui/Icon'
import LoadingSpinner from '~/src/ui/LoadingSpinner'
import Dialog from '../Dialog'
import './SignInDialog.css'

function SignInDialog (): React.ReactElement {
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [error, setError] = useState(false)
  const [signingIn, setSigningIng] = useState(false)

  const emailInputEl = useRef<HTMLInputElement>(null)
  const emailInputId = useId()

  useEffect(() => {
    emailInputEl.current?.focus()
  }, [])

  function handleChange (event: React.ChangeEvent<HTMLInputElement>): void {
    const target = event.target
    const value = target.value

    setEmail(value)
  }

  function handleFacebookSignIn (event: React.MouseEvent): void {
    event.preventDefault()
    setSigningIng(true)
    goFacebookSignIn()
  }

  function handleGoogleSignIn (event: React.MouseEvent): void {
    event.preventDefault()
    setSigningIng(true)
    goGoogleSignIn()
  }

  function handleTwitterSignIn (event: React.MouseEvent): void {
    event.preventDefault()
    setSigningIng(true)
    goTwitterSignIn()
  }

  function handleGoEmailSignIn (error: string | null): void {
    if (error !== null) {
      console.error(error)
      return
    }

    setSendingEmail(false)
    setEmailSent(true)
    // Reset error state
    setError(false)
  }

  function handleEmailResend (event: React.MouseEvent): void {
    event.preventDefault()
    setEmailSent(false)
  }

  function handleSubmit (event: React.FormEvent): void {
    event.preventDefault()

    // Note: we don't validate the input here;
    // we let HTML5 <input type="email" required /> do validation
    goEmailSignIn(email, handleGoEmailSignIn)
    setSendingEmail(true)
  }

  function ErrorMessage (): React.ReactElement {
    return (
      <p className="sign-in-error-message">
        <FormattedMessage
          id="dialogs.sign-in.email-invalid"
          defaultMessage="Oops! That didn’t look like a valid email address. Please try again."
        />
      </p>
    )
  }

  function SignInWaiting (): React.ReactElement {
    return (
      <Dialog>
        {() => (
          <div className="sign-in-dialog">
            <header>
              <h1>
                <FormattedMessage
                  id="dialogs.sign-in.loading-message"
                  defaultMessage="Signing you in…"
                />
              </h1>
            </header>
            <div
              className="dialog-content sign-in-loading"
              aria-live="polite"
              aria-busy="true"
            >
              <LoadingSpinner />
            </div>
          </div>
        )}
      </Dialog>
    )
  }

  function EmailSent (): React.ReactElement {
    return (
      <Dialog>
        {() => (
          <div className="sign-in-dialog">
            <header>
              <h1>
                <FormattedMessage
                  id="dialogs.sign-in.loading-message"
                  defaultMessage="Signing you in…"
                />
              </h1>
            </header>
            <div className="dialog-content sign-in-email-sent">
              <p>
                <FormattedMessage
                  id="dialogs.sign-in.sent-message-with-email"
                  defaultMessage="We’ve sent an email to {email}. Please follow the instructions there to continue signing in!"
                  values={{
                    email: <span className="sign-in-email">{email}</span>
                  }}
                />
              </p>
              <p className="sign-in-resend">
                <FormattedMessage
                  id="dialogs.sign-in.email-unreceived"
                  defaultMessage="Didn’t receive it?"
                />
                <br />
                <a onClick={handleEmailResend}>
                  <FormattedMessage
                    id="dialogs.sign-in.resend-email"
                    defaultMessage="Resend email"
                  />
                </a>
              </p>
            </div>
          </div>
        )}
      </Dialog>
    )
  }

  if (sendingEmail || signingIn) {
    return <SignInWaiting />
  } else if (emailSent) {
    return <EmailSent />
  }

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="sign-in-dialog">
          <header>
            <h1>
              <FormattedMessage
                id="dialogs.sign-in.heading"
                defaultMessage="Sign in / Sign up"
              />
            </h1>
          </header>
          <div className="dialog-content">
            <p>
              <FormattedMessage
                id="dialogs.sign-in.description"
                defaultMessage="Save your first design or sign in to access your past designs."
              />
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor={emailInputId} className="sign-in-email-label">
                <FormattedMessage
                  id="dialogs.sign-in.email-label"
                  defaultMessage="Email"
                />
              </label>

              <input
                type="email"
                id={emailInputId}
                ref={emailInputEl}
                value={email}
                className={
                  'sign-in-input ' + (error ? 'sign-in-input-error' : '')
                }
                name="email"
                onChange={handleChange}
                placeholder="test@test.com"
                required={true}
              />

              {error && <ErrorMessage />}

              <p className="sign-in-email-password-note">
                <small>
                  <FormattedMessage
                    id="dialogs.sign-in.email-description"
                    defaultMessage="We’ll send you a link to sign in. No password is required."
                  />
                </small>
              </p>

              <Button
                type="submit"
                primary={true}
                className="sign-in-button sign-in-email-button"
              >
                <FormattedMessage
                  id="dialogs.sign-in.button.email"
                  defaultMessage="Continue with email"
                />
              </Button>
            </form>

            <div className="sign-in-social-heading">
              <hr />
              <span>
                <FormattedMessage
                  id="dialogs.sign-in.social-heading"
                  defaultMessage="or"
                />
              </span>
            </div>

            <Button
              tertiary={true}
              className="sign-in-button sign-in-social-button sign-in-twitter-button"
              onClick={handleTwitterSignIn}
            >
              <Icon name="twitter" />
              <FormattedMessage
                id="dialogs.sign-in.button.twitter"
                defaultMessage="Continue with Twitter"
              />
            </Button>

            <Button
              tertiary={true}
              className="sign-in-button sign-in-social-button sign-in-google-button"
              onClick={handleGoogleSignIn}
            >
              <Icon name="google" />
              <FormattedMessage
                id="dialogs.sign-in.button.google"
                defaultMessage="Continue with Google"
              />
            </Button>

            <Button
              tertiary={true}
              className="sign-in-button sign-in-social-button sign-in-facebook-button"
              onClick={handleFacebookSignIn}
            >
              <Icon name="facebook" />
              <FormattedMessage
                id="dialogs.sign-in.button.facebook"
                defaultMessage="Continue with Facebook"
              />
            </Button>
          </div>

          <footer>
            <p className="sign-in-disclaimer">
              <FormattedMessage
                id="dialogs.sign-in.tos"
                defaultMessage="By clicking one of these buttons, I agree to the {tosLink} and {privacyLink}."
                values={{
                  tosLink: (
                    <a href="/terms-of-service" target="_blank">
                      <FormattedMessage
                        id="dialogs.sign-in.tos-link-label"
                        defaultMessage="terms of service"
                      />
                    </a>
                  ),
                  privacyLink: (
                    <a href="/privacy-policy" target="_blank">
                      <FormattedMessage
                        id="dialogs.sign-in.privacy-link-label"
                        defaultMessage="privacy policy"
                      />
                    </a>
                  )
                }}
              />
            </p>
          </footer>
        </div>
      )}
    </Dialog>
  )
}

export default SignInDialog
