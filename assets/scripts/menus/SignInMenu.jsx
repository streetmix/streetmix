import React from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Menu from './Menu'
import { goTwitterSignIn, goFacebookSignIn, goGoogleSignIn } from '../app/routing'
import { showDialog } from '../store/actions/dialogs'

export class SignInMenu extends React.Component {
  static propTypes = {
    showDialog: PropTypes.func.isRequired,
    emailAuthEnabled: PropTypes.bool,
    facebookAuthEnabled: PropTypes.bool,
    googleAuthEnabled: PropTypes.bool
  }

  handleTwitterSignIn = (event) => {
    event.preventDefault()
    goTwitterSignIn()
  }

  handleFacebookSignIn = (event) => {
    event.preventDefault()
    goFacebookSignIn()
  }

  handleGoogleSignIn = (event) => {
    event.preventDefault()
    goGoogleSignIn()
  }

  onClickEmailSignIn = (event) => {
    event.preventDefault()
    this.props.showDialog()
  }

  renderEmailAuthLink = () => {
    const { emailAuthEnabled } = this.props
    if (emailAuthEnabled) {
      return (
        <a href="#" onClick={this.onClickEmailSignIn}>
          <svg className="icon">
            <use xlinkHref="#icon-forums" />
          </svg>
          <FormattedMessage id="menu.sign-in.email" defaultMessage="Sign in with Email" />
        </a>
      )
    }
  }

<<<<<<< HEAD
  render () {
    return (
      <Menu {...this.props}>
        <a href="#" onClick={this.handleTwitterSignIn}>
          <svg className="icon">
            <use xlinkHref="#icon-twitter" />
          </svg>
          <FormattedMessage id="menu.sign-in.twitter" defaultMessage="Sign in with Twitter" />
        </a>
        {this.renderEmailAuthLink()}
=======
  renderFacbookAuthLink = () => {
    const { facebookAuthEnabled } = this.props
    if (facebookAuthEnabled) {
      return (
>>>>>>> Add Google and Facebook Authentication to flags
        <a href="#" onClick={this.handleFacebookSignIn}>
          <svg className="icon">
            <use xlinkHref="#icon-facebook" />
          </svg>
          <FormattedMessage id="menu.signin.facebook" defaultMessage="Sign in with Facebook" />
        </a>
      )
    }
  }

  renderGoogleAuthLink = () => {
    const { googleAuthEnabled } = this.props
    if (googleAuthEnabled) {
      return (
        <a href="#" onClick={this.handleGoogleSignIn}>
          <svg className="icon">
            <use xlinkHref="#icon-google" />
          </svg>
          <FormattedMessage id="menu.signin.google" defaultMessage="Sign in with Google" />
        </a>
      )
    }
  }

  render () {
    return (
      <Menu {...this.props}>
        <a href="#" onClick={this.handleTwitterSignIn}>
          <svg className="icon">
            <use xlinkHref="#icon-twitter" />
          </svg>
          <FormattedMessage id="menu.signin.twitter" defaultMessage="Sign in with Twitter" />
        </a>
        {this.renderEmailAuthLink()}
        {this.renderFacbookAuthLink()}
        {this.renderGoogleAuthLink()}
      </Menu>
    )
  }
}

function mapDispatchToProps (dispatch) {
  return {
    showDialog: () => { dispatch(showDialog('EMAIL_SIGN_IN')) }
  }
}

function mapStateToProps (state) {
  return {
    emailAuthEnabled: state.flags.EMAIL_AUTHENTICATION.value,
    facebookAuthEnabled: state.flags.FACEBOOK_AUTHENTICATION.value,
    googleAuthEnabled: state.flags.GOOGLE_AUTHENTICATION.value
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignInMenu)
