import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import './SignInButton.scss'

SignInButton.propTypes = {
  onClick: PropTypes.func
}

function SignInButton ({ onClick = () => {} }) {
  return (
    <button className="menu-sign-in button-primary" onClick={onClick}>
      <FormattedMessage id="menu.item.sign-in" defaultMessage="Sign in" />
    </button>
  )
}

export default SignInButton
