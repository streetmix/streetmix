import React from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Menu from './Menu'
import { goTwitterSignIn } from '../app/routing'
import { showDialog } from '../store/actions/dialogs'

export class SignInMenu extends React.Component {
  static propTypes = {
    showDialog: PropTypes.func.isRequired
  }

  handleTwitterSignIn = (event) => {
    event.preventDefault()
    goTwitterSignIn()
  }

  onClickEmailSignIn = (event) => {
    event.preventDefault()
    this.props.showDialog()
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
        <a href="#" onClick={this.onClickEmailSignIn}>
          <svg className="icon">
            <use xlinkHref="#icon-forums" />
          </svg>
          <FormattedMessage id="menu.signin.email" defaultMessage="Sign in with Email" />
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

export default connect(null, mapDispatchToProps)(SignInMenu)
