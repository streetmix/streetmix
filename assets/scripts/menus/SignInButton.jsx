import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import Button from '../ui/Button'
import './SignInButton.scss'

SignInButton.propTypes = {
  onClick: PropTypes.func
}

function SignInButton ({ onClick = () => {} }) {
  return (
    <Button primary={true} className="menu-sign-in" onClick={onClick}>
      <FormattedMessage id="menu.item.sign-in" defaultMessage="Sign in" />
    </Button>
  )
}

export default SignInButton
