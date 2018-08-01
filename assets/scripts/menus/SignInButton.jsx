import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

function SignInButton (props) {
  return (
    <button
      className="menu-sign-in"
      onClick={props.onClick}
    >
      <FormattedMessage id="menu.item.sign-in" defaultMessage="Sign in" />
    </button>
  )
}

SignInButton.propTypes = {
  onClick: PropTypes.func
}

SignInButton.defaultProps = {
  onClick: () => {}
}

export default SignInButton
