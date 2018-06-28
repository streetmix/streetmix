import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { isEmail } from 'validator'
import { goEmailSignIn, goTwitterSignIn } from '../app/routing'

class SignInDialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      emailSent: false,
      sendingEmail: false,
      error: false,
      errorMesg: ''
    }
  }

  static propTypes = {
    emailAuthEnabled: PropTypes.bool,
    facebookAuthEnabled: PropTypes.bool,
    googleAuthEnabled: PropTypes.bool,
    twitterAuthEnabled: PropTypes.bool
  }

  handleChange = (event) => {
    const target = event.target
    const name = target.name
    const value = target.value

    this.setState({
      [name]: value
    })
  }

  handleTwitterSignIn = (event) => {
    event.preventDefault()
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
      return (<p className="error-message">
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
          <p className="email-title">
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
              className={'form-control ' + (error ? 'error-occured' : '')}
              name="email"
              onChange={this.handleChange}
              placeholder="test@test.com"
            />
            {this.renderErrorMesg()}
            <button type="submit"
              disabled={!isEnabled}
              className="sign-in-btn sign-in-email-btn"
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
        <button className="sign-in-btn sign-in-facebook-btn">
          <svg className="icon">
            <use xlinkHref="#icon-facebook" />
          </svg>
          <FormattedMessage id="dialogs.sign-in.button.facebook" defaultMessage="Sign in with Facebook" />
        </button>
      )
    }
  }

  renderGoogleAuth () {
    const { googleAuthEnabled } = this.props
    if (googleAuthEnabled) {
      return (
        <button className="sign-in-btn sign-in-google-btn">
          <img className="icon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IgogICAgIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIKICAgICB2aWV3Qm94PSIwIDAgNDggNDgiCiAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDsiPjxnIGlkPSJzdXJmYWNlMSI+PHBhdGggc3R5bGU9IiBmaWxsOiNGRkMxMDc7IiBkPSJNIDQzLjYwOTM3NSAyMC4wODIwMzEgTCA0MiAyMC4wODIwMzEgTCA0MiAyMCBMIDI0IDIwIEwgMjQgMjggTCAzNS4zMDQ2ODggMjggQyAzMy42NTIzNDQgMzIuNjU2MjUgMjkuMjIyNjU2IDM2IDI0IDM2IEMgMTcuMzcxMDk0IDM2IDEyIDMwLjYyODkwNiAxMiAyNCBDIDEyIDE3LjM3MTA5NCAxNy4zNzEwOTQgMTIgMjQgMTIgQyAyNy4wNTg1OTQgMTIgMjkuODQzNzUgMTMuMTUyMzQ0IDMxLjk2MDkzOCAxNS4wMzkwNjMgTCAzNy42MTcxODggOS4zODI4MTMgQyAzNC4wNDY4NzUgNi4wNTQ2ODggMjkuMjY5NTMxIDQgMjQgNCBDIDEyLjk1MzEyNSA0IDQgMTIuOTUzMTI1IDQgMjQgQyA0IDM1LjA0Njg3NSAxMi45NTMxMjUgNDQgMjQgNDQgQyAzNS4wNDY4NzUgNDQgNDQgMzUuMDQ2ODc1IDQ0IDI0IEMgNDQgMjIuNjYwMTU2IDQzLjg2MzI4MSAyMS4zNTE1NjMgNDMuNjA5Mzc1IDIwLjA4MjAzMSBaICI+PC9wYXRoPjxwYXRoIHN0eWxlPSIgZmlsbDojRkYzRDAwOyIgZD0iTSA2LjMwNDY4OCAxNC42OTE0MDYgTCAxMi44Nzg5MDYgMTkuNTExNzE5IEMgMTQuNjU2MjUgMTUuMTA5Mzc1IDE4Ljk2MDkzOCAxMiAyNCAxMiBDIDI3LjA1ODU5NCAxMiAyOS44NDM3NSAxMy4xNTIzNDQgMzEuOTYwOTM4IDE1LjAzOTA2MyBMIDM3LjYxNzE4OCA5LjM4MjgxMyBDIDM0LjA0Njg3NSA2LjA1NDY4OCAyOS4yNjk1MzEgNCAyNCA0IEMgMTYuMzE2NDA2IDQgOS42NTYyNSA4LjMzNTkzOCA2LjMwNDY4OCAxNC42OTE0MDYgWiAiPjwvcGF0aD48cGF0aCBzdHlsZT0iIGZpbGw6IzRDQUY1MDsiIGQ9Ik0gMjQgNDQgQyAyOS4xNjQwNjMgNDQgMzMuODU5Mzc1IDQyLjAyMzQzOCAzNy40MTAxNTYgMzguODA4NTk0IEwgMzEuMjE4NzUgMzMuNTcwMzEzIEMgMjkuMjEwOTM4IDM1LjA4OTg0NCAyNi43MTQ4NDQgMzYgMjQgMzYgQyAxOC43OTY4NzUgMzYgMTQuMzgyODEzIDMyLjY4MzU5NCAxMi43MTg3NSAyOC4wNTQ2ODggTCA2LjE5NTMxMyAzMy4wNzgxMjUgQyA5LjUwMzkwNiAzOS41NTQ2ODggMTYuMjI2NTYzIDQ0IDI0IDQ0IFogIj48L3BhdGg+PHBhdGggc3R5bGU9IiBmaWxsOiMxOTc2RDI7IiBkPSJNIDQzLjYwOTM3NSAyMC4wODIwMzEgTCA0MiAyMC4wODIwMzEgTCA0MiAyMCBMIDI0IDIwIEwgMjQgMjggTCAzNS4zMDQ2ODggMjggQyAzNC41MTE3MTkgMzAuMjM4MjgxIDMzLjA3MDMxMyAzMi4xNjQwNjMgMzEuMjE0ODQ0IDMzLjU3MDMxMyBDIDMxLjIxODc1IDMzLjU3MDMxMyAzMS4yMTg3NSAzMy41NzAzMTMgMzEuMjE4NzUgMzMuNTcwMzEzIEwgMzcuNDEwMTU2IDM4LjgwODU5NCBDIDM2Ljk3MjY1NiAzOS4yMDMxMjUgNDQgMzQgNDQgMjQgQyA0NCAyMi42NjAxNTYgNDMuODYzMjgxIDIxLjM1MTU2MyA0My42MDkzNzUgMjAuMDgyMDMxIFogIj48L3BhdGg+PC9nPjwvc3ZnPg==" />
          <FormattedMessage id="dialogs.sign-in.button.google" defaultMessage="Sign in with Google" />
        </button>
      )
    }
  }

  renderTwitterAuth () {
    const { twitterAuthEnabled } = this.props
    if (twitterAuthEnabled) {
      return (
        <button className="sign-in-btn sign-in-twitter-btn" onClick={this.handleTwitterSignIn}>
          <svg className="icon">
            <use xlinkHref="#icon-twitter" />
          </svg>
          <FormattedMessage id="dialogs.sign-in.button.twitter" defaultMessage="Sign in with Twitter" />
        </button>
      )
    }
  }

  render () {
    const { email, sendingEmail, emailSent } = this.state
    if (sendingEmail) {
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
          <div className="email-sent-block">
            <p className="sign-in-message">
              <FormattedMessage id="dialogs.sign-in.loading-message" defaultMessage="Signing you in..." />
            </p>
            <p className="sign-in-sent-message-with-email">
              <FormattedMessage
                id="dialogs.sign-in.sent-message-with-email"
                defaultMessage="We've sent an email to "
              />
              <span className="email">{email}.</span>
            </p>
            <p className="sign-in-sent-message">
              <FormattedMessage
                id="dialogs.sign-in.sent-message"
                defaultMessage="Please follow the instructions in that email to continue!"
              />
            </p>
            <button onClick={this.handleEmailResend} className="sign-in-btn sign-in-email-btn">
              <FormattedMessage
                id="dialogs.sign-in.button.resend"
                defaultMessage="Didn't receive it? Resend email"
              />
            </button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="sign-in-dialog">
          <h1><FormattedMessage id="dialogs.sign-in.heading" defaultMessage="Sign into Streetmix" /></h1>
          <p>
            <FormattedMessage
              id="dialogs.sign-in.description"
              defaultMessage="If you don't already have a Streetmix account, we'll make one for you."
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
