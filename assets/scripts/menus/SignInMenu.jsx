import React from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Menu from './Menu'
import { goTwitterSignIn, goFacebookSignIn } from '../app/routing'
import { showDialog } from '../store/actions/dialogs'

export class SignInMenu extends React.Component {
  static propTypes = {
    showDialog: PropTypes.func.isRequired,
    emailAuthEnabled: PropTypes.bool
  }

  handleTwitterSignIn = (event) => {
    event.preventDefault()
    goTwitterSignIn()
  }

  handleFacebookSignIn = (event) => {
    event.preventDefault()
    goFacebookSignIn()
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
        <a href="#" onClick={this.handleFacebookSignIn}>
          <svg className="icon">
            <use xlinkHref="#icon-facebook" />
          </svg>
          <FormattedMessage id="menu.signin.facebook" defaultMessage="Sign in with Facebook" />
        </a>
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
    emailAuthEnabled: state.flags.EMAIL_AUTHENTICATION.value
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignInMenu)
