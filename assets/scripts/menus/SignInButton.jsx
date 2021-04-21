import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import './SignInButton.scss'

SignInButton.propTypes = {
  onClick: PropTypes.func
}

SignInToUpgradeButton.propTypes = {
  onClick: PropTypes.func
}

function SignInButton ({ onClick = () => {} }) {
  return (
    <button className="menu-sign-in button-secondary" onClick={onClick}>
      <FormattedMessage id="menu.item.sign-in" defaultMessage="Sign in" />
    </button>
  )
}

export function SignInToUpgradeButton ({ onClick = () => {} }) {
  return (
    <button className="menu-sign-in button-secondary" onClick={onClick}>
      <FormattedMessage
        id="menu.item.sign-in-upgrade"
        defaultMessage="Sign in to Upgrade"
      />
    </button>
  )
}

export default SignInButton
