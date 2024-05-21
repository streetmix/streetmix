import React from 'react'
import { FormattedMessage } from 'react-intl'

import { doSignIn } from '~/src/users/authentication'

function SignInPromo (): React.ReactElement {
  function handleClickSignIn (event: React.MouseEvent): void {
    event.preventDefault()
    doSignIn()
  }

  const signInLink = (
    <a onClick={handleClickSignIn}>
      <FormattedMessage
        defaultMessage="Sign in"
        id="menu.share.sign-in-twitter-link"
      />
    </a>
  )

  return (
    <div className="share-sign-in-promo">
      <FormattedMessage
        id="menu.share.sign-in-link"
        defaultMessage="{signInLink} for nicer links to your streets and your personal street gallery"
        values={{
          signInLink
        }}
      />
    </div>
  )
}

export default SignInPromo
