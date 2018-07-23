import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { isEmail } from 'validator'
import { goEmailSignIn, goTwitterSignIn, goFacebookSignIn, goGoogleSignIn } from '../app/routing'
import Icon from '../ui/Icon'

export class SignInDialog extends React.Component {
  static propTypes = {
    emailAuthEnabled: PropTypes.bool,
    facebookAuthEnabled: PropTypes.bool,
    googleAuthEnabled: PropTypes.bool,
    twitterAuthEnabled: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.state = {
      email: '',
      emailSent: false,
      sendingEmail: false,
      error: false,
      signingIn: false
    }

    this.emailInputEl = React.createRef()
  }

  componentDidMount = () => {
    if (this.props.emailAuthEnabled) {
      this.emailInputEl.current.focus()
    }
  }

  handleChange = (event) => {
    const target = event.target
    const name = target.name
    const value = target.value

    this.setState({
      [name]: value
    })
  }

  handleFacebookSignIn = (event) => {
    event.preventDefault()

    this.setState({
      signingIn: true
    })

    goFacebookSignIn()
  }

  handleGoogleSignIn = (event) => {
    event.preventDefault()

    this.setState({
      signingIn: true
    })

    goGoogleSignIn()
  }

  handleTwitterSignIn = (event) => {
    event.preventDefault()

    this.setState({
      signingIn: true
    })

    goTwitterSignIn()
  }

  handleGoEmailSignIn = (error, res) => {
    if (error) {
      console.error(error)
      return
    }

    this.setState({
      sendingEmail: false,
      emailSent: true,
      // Reset error state
      error: false
    })
  }

  handleEmailResend = (event) => {
    event.preventDefault()

    this.setState({
      emailSent: false
    })
  }

  handleSubmit = (event) => {
    event.preventDefault()

    const { email } = this.state

    if (isEmail(email)) {
      this.setState({
        sendingEmail: true
      })
      goEmailSignIn(email, this.handleGoEmailSignIn)
    } else {
      this.setState({
        error: true
      })
    }
  }

  renderErrorMsg = () => {
    return (
      <p className="sign-in-error-message">
        <FormattedMessage
          id="dialogs.sign-in.email-invalid"
          defaultMessage="Oops! That didn’t look like a valid email address. Please try again."
        />
      </p>
    )
  }

  renderEmailAuth () {
    return (
      <React.Fragment>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="sign-in-email-input" className="sign-in-email-label">
            <FormattedMessage id="dialogs.sign-in.email-label" defaultMessage="Email" />
          </label>

          <input
            type="email"
            id="sign-in-email-input"
            ref={this.emailInputEl}
            value={this.state.email}
            className={'sign-in-input ' + (this.state.error ? 'sign-in-input-error' : '')}
            name="email"
            onChange={this.handleChange}
            placeholder="test@test.com"
          />

          {this.state.error && this.renderErrorMsg()}

          <p className="sign-in-email-password-note">
            <small>
              <FormattedMessage
                id="dialogs.sign-in.email-description"
                defaultMessage="We’ll send you a link to sign in. No password is required."
              />
            </small>
          </p>

          <button type="submit" className="sign-in-button sign-in-email-button">
            <FormattedMessage id="dialogs.sign-in.button.email" defaultMessage="Continue with email" />
          </button>
        </form>
      </React.Fragment>
    )
  }

  renderFacebookAuth () {
    return (
      <button className="sign-in-button sign-in-social-button sign-in-facebook-button" onClick={this.handleFacebookSignIn}>
        <Icon icon="facebook" />
        <FormattedMessage id="dialogs.sign-in.button.facebook" defaultMessage="Continue with Facebook" />
      </button>
    )
  }

  renderGoogleAuth () {
    return (
      <button className="sign-in-button sign-in-social-button sign-in-google-button" onClick={this.handleGoogleSignIn}>
        <Icon icon="google" />
        <FormattedMessage id="dialogs.sign-in.button.google" defaultMessage="Continue with Google" />
      </button>
    )
  }

  renderTwitterAuth () {
    return (
      <button className="sign-in-button sign-in-social-button sign-in-twitter-button" onClick={this.handleTwitterSignIn}>
        <Icon icon="twitter" />
        <FormattedMessage id="dialogs.sign-in.button.twitter" defaultMessage="Continue with Twitter" />
      </button>
    )
  }

  render () {
    const { email, sendingEmail, emailSent, signingIn } = this.state

    if (sendingEmail || signingIn) {
      return (
        <div className="sign-in-dialog">
          <p className="sign-in-loading-message">
            <FormattedMessage id="dialogs.sign-in.loading-message" defaultMessage="Signing you in..." />
          </p>
          <div className="loading-spinner" />
        </div>
      )
    } else if (emailSent) {
      return (
        <div className="sign-in-dialog">
          <p className="sign-in-loading-message">
            <FormattedMessage id="dialogs.sign-in.loading-message" defaultMessage="Signing you in..." />
          </p>
          <div className="sign-in-email-sent">
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
              <FormattedMessage id="dialogs.sign-in.email-unreceived" defaultMessage="Didn’t receive it?" />
              <br />
              <a onClick={this.handleEmailResend}>
                <FormattedMessage id="dialogs.sign-in.resend-email" defaultMessage="Resend email" />
              </a>
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="sign-in-dialog">
        <h1><FormattedMessage id="dialogs.sign-in.heading" defaultMessage="Sign in to Streetmix" /></h1>
        <p>
          <FormattedMessage
            id="dialogs.sign-in.description"
            defaultMessage="Create your free Streetmix account to save your street designs, or return to an existing account and street collection."
          />
        </p>

        {this.props.emailAuthEnabled && this.renderEmailAuth()}
        {this.props.emailAuthEnabled && (
          this.props.twitterAuthEnabled ||
          this.props.googleAuthEnabled ||
          this.props.facebookAuthEnabled) && (
          <div className="sign-in-social-heading">
            <hr />
            <FormattedMessage id="dialogs.sign-in.social-heading" defaultMessage="or" />
          </div>
        )}

        {this.props.twitterAuthEnabled && this.renderTwitterAuth()}
        {this.props.googleAuthEnabled && this.renderGoogleAuth()}
        {this.props.facebookAuthEnabled && this.renderFacebookAuth()}

        <p className="sign-in-disclaimer">
          <FormattedMessage id="dialogs.sign-in.tos" defaultMessage="By clicking one of these buttons, I agree to the {tosLink} and {privacyLink}." values={{
            tosLink: <a href="/terms-of-service" target="_blank">terms of service</a>,
            privacyLink: <a href="/privacy-policy" target="_blank">privacy policy</a>
          }} />
        </p>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    emailAuthEnabled: state.flags.EMAIL_AUTHENTICATION.value,
    facebookAuthEnabled: state.flags.FACEBOOK_AUTHENTICATION.value,
    googleAuthEnabled: state.flags.GOOGLE_AUTHENTICATION.value,
    twitterAuthEnabled: state.flags.TWITTER_AUTHENTICATION.value
  }
}

export default connect(mapStateToProps, null)(SignInDialog)
