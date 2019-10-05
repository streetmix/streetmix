import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

function SignInButton ({ onClick = () => {} }) {
  return (
    <button
      className="menu-sign-in"
      onClick={onClick}
    >
      <FormattedMessage id="menu.item.sign-in" defaultMessage="Sign in" />
    </button>
  )
}

SignInButton.propTypes = {
  onClick: PropTypes.func
}

export default SignInButton
