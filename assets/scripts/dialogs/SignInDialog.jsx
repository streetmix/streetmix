import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { isEmail } from 'validator'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
      sendingEmail: true,
      error: false,
      errorMesg: '',
      signingIn: false
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

  handleGoEmailSignIn = (err, res) => {
    if (err) {
      console.log(err)
      return
    }
    this.setState({
      sendingEmail: false,
      emailSent: true
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
        error: true,
        errorMesg: 'Oops! That didn\'t look like a valid email address. Please try again.'
      })
    }
  }

  renderErrorMesg = () => {
    const { error, errorMesg } = this.state

    if (error) {
      return (<p className="sign-in-error-message">
        <FormattedMessage
          id="dialogs.sign-in.email-error-message"
          defaultMessage={errorMesg}
        />
      </p>)
    }
  }

  renderEmailAuth () {
    const { emailAuthEnabled } = this.props
    const { email, error } = this.state
    const isEnabled = (email.length > 0)

    if (emailAuthEnabled) {
      return (
        <React.Fragment>
          <p className="sign-in-email-title">
            <FormattedMessage
              id="dialogs.sign-in.email-title"
              defaultMessage="Or use your email address"
            />
          </p>
          <p className="email-description">
            <FormattedMessage
              id="dialogs.sign-in.email-description"
              defaultMessage="We'll send you a link. No password is required."
            />
          </p>
          <form onSubmit={this.handleSubmit}>
            <input type="email"
              value={email}
              className={'form-control ' + (error ? 'sign-in-error-occured' : '')}
              name="email"
              onChange={this.handleChange}
              placeholder="test@test.com"
            />
            {this.renderErrorMesg()}
            <button type="submit"
              disabled={!isEnabled}
              className="sign-in-button sign-in-email-button"
            >
              <FormattedMessage id="dialogs.sign-in.button.email" defaultMessage="Sign in with email" />
            </button>
          </form>
        </React.Fragment>
      )
    }
  }

  renderFacebookAuth () {
    const { facebookAuthEnabled } = this.props
    if (facebookAuthEnabled) {
      return (
        <button onClick={this.handleFacebookSignIn} className="sign-in-button sign-in-facebook-button">
          <FontAwesomeIcon icon={['fab', 'facebook-square']} />
          <FormattedMessage id="dialogs.sign-in.button.facebook" defaultMessage="Continue with Facebook" />
        </button>
      )
    }
  }

  renderGoogleAuth () {
    const { googleAuthEnabled } = this.props
    if (googleAuthEnabled) {
      return (
        <button onClick={this.handleGoogleSignIn} className="sign-in-button sign-in-google-button">
          <Icon icon="google" />
          <FormattedMessage id="dialogs.sign-in.button.google" defaultMessage="Continue with Google" />
        </button>
      )
    }
  }

  renderTwitterAuth () {
    const { twitterAuthEnabled } = this.props
    if (twitterAuthEnabled) {
      return (
        <button className="sign-in-button sign-in-twitter-button" onClick={this.handleTwitterSignIn}>
          <FontAwesomeIcon icon={['fab', 'twitter']} />
          <FormattedMessage id="dialogs.sign-in.button.twitter" defaultMessage="Continue with Twitter" />
        </button>
      )
    }
  }

  render () {
    const { email, sendingEmail, emailSent, signingIn } = this.state
    if (sendingEmail || signingIn) {
      return (
        <div className="sign-in-dialog">
          <p className="sign-in-message sign-in-loading-message">
            <FormattedMessage id="dialogs.sign-in.loading-message" defaultMessage="Signing you in..." />
          </p>
          <div className="loading-spinner" />
        </div>
      )
    } else if (emailSent) {
      return (
        <div className="sign-in-dialog">
          <div className="sign-in-email-sent-block">
            <p className="sign-in-message">
              <FormattedMessage id="dialogs.sign-in.loading-message" defaultMessage="Signing you in..." />
            </p>
            <p className="sign-in-sent-message-with-email">
              <FormattedMessage
                id="dialogs.sign-in.sent-message-with-email"
                defaultMessage="We’ve sent an email to "
              />
              <span className="sign-in-email">{email}.</span>
            </p>
            <p className="sign-in-sent-message">
              <FormattedMessage
                id="dialogs.sign-in.sent-message"
                defaultMessage="Please follow the instructions in that email to continue!"
              />
            </p>
            <button onClick={this.handleEmailResend} className="sign-in-button sign-in-email-button">
              <FormattedMessage
                id="dialogs.sign-in.button.resend"
                defaultMessage="Didn’t receive it? Resend email"
              />
            </button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="sign-in-dialog">
          <h1><FormattedMessage id="dialogs.sign-in.heading" defaultMessage="Sign in to Streetmix" /></h1>
          <p>
            <FormattedMessage
              id="dialogs.sign-in.description"
              defaultMessage="If you don't already have a Streetmix account, we’ll make one for you."
            />
          </p>
          {this.renderTwitterAuth()}
          {this.renderGoogleAuth()}
          {this.renderFacebookAuth()}
          {this.renderEmailAuth()}
        </div>
      )
    }
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
