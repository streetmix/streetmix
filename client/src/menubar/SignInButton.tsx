import React from 'react'
import { FormattedMessage } from 'react-intl'

import Button from '../ui/Button.js'
import './SignInButton.css'

interface SignInButtonProps {
  onClick: React.MouseEventHandler
}

function SignInButton({ onClick = () => undefined }: SignInButtonProps) {
  return (
    <Button primary className="menu-sign-in" onClick={onClick}>
      <FormattedMessage id="menu.item.sign-in" defaultMessage="Sign in" />
    </Button>
  )
}

export default SignInButton
