import React from 'react'
import { FormattedMessage } from 'react-intl'
import { goTwitterSignIn, goEmailSignIn } from '../app/routing'
import Menu from './Menu'

export default class SignInMenu extends React.Component {
  handleTwitterSignIn = (event) => {
    event.preventDefault()
    goTwitterSignIn()
  }

  handleEmailSignIn = (event) => {
    event.preventDefault()
    goEmailSignIn()
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
        <a href="#" onClick={this.handleEmailSignIn}>
          <svg className="icon">
            <use xlinkHref="#icon-forums" />
          </svg>
          <FormattedMessage id="menu.signin.email" defaultMessage="Sign in with Email" />
        </a>
      </Menu>
    )
  }
}
