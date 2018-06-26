import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { isEmail } from 'validator'
import { goEmailSignIn } from '../app/routing'

export default class SignInDialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      emailSent: false
    }
  }

  static propTypes = {
    closeDialog: PropTypes.func.isRequired
  }

  handleChange = (event) => {
    const target = event.target
    const name = target.name
    const value = target.value

    this.setState({
      [name]: value
    })
  }

  onClickResend = (event) => {
    event.preventDefault()
    this.setState({
      emailSent: false
    })
  }

  handleGoEmailSignIn = (err, res) => {
    if (err) {
      console.log(err)
      return
    }
    this.setState({
      emailSent: true
    })
  }

  handleSubmit = (event) => {
    event.preventDefault()
    const { email } = this.state

    if (isEmail(email)) {
      goEmailSignIn(email, this.handleGoEmailSignIn)
      // TODO: Add a loding sign to email
    } else {
      // Todo send a feedback
      console.log('Invlaid Email')
    }
  }

  onClickClose = (event) => {
    this.props.closeDialog()
  }

  renderSignInForm = (email, emailSent) => {
    const signInForm = (
      <form onSubmit={this.handleSubmit}>
        <div className="form-group">
          <input type="email" value={email} className="form-control" name="email" onChange={this.handleChange} placeholder="Email" required />
        </div>
        <div className="form-group">
          <input className="btn" type="submit" value="Sign in" />
        </div>
      </form>
    )
    const resendLink = (
      <a href="#"className="button-like" onClick={this.onClickResend}> Resend </a>
    )
    const feedbackMessage = (
      <p>A validation link was sent to {email}, click to validate. {resendLink} </p>
    )

    if (emailSent) {
      return feedbackMessage
    }
    return signInForm
  }

  render () {
    const { email, emailSent } = this.state

    return (
      <div className="email-sign-in-dialog">
        <h1><FormattedMessage id="dialogs.email-sign-in.heading" defaultMessage="Sign in with email" /></h1>
        {this.renderSignInForm(email, emailSent)}
      </div>
    )
  }
}
