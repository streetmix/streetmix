import React from 'react'
import { FormattedMessage } from 'react-intl'

import Button from '../ui/Button'
import './SignInButton.css'

interface SignInButtonProps {
  onClick: () => void
}

function SignInButton ({
  onClick = () => undefined
}: SignInButtonProps): React.ReactElement {
  return (
    <Button primary={true} className="menu-sign-in" onClick={onClick}>
      <FormattedMessage id="menu.item.sign-in" defaultMessage="Sign in" />
    </Button>
  )
}

export default SignInButton
