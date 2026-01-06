import { FormattedMessage } from 'react-intl'

import { doSignIn } from '~/src/users/authentication.js'
import './SignInPromo.css'

interface SignInPromoProps {
  type: 'share' | 'template'
}

export function SignInPromo({ type }: SignInPromoProps) {
  function handleClickSignIn(event: React.MouseEvent): void {
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

  if (type === 'share') {
    return (
      <div className="share-sign-in-promo sign-in-promo">
        <FormattedMessage
          id="menu.share.sign-in-link"
          defaultMessage="{signInLink} for nicer links to your streets and your personal street gallery."
          values={{
            signInLink,
          }}
        />
      </div>
    )
  } else if (type === 'template') {
    return (
      <div className="template-sign-in-promo sign-in-promo">
        <FormattedMessage
          id="menu.new-street.sign-in-link"
          defaultMessage="{signInLink} for access to templates."
          values={{
            signInLink,
          }}
        />
      </div>
    )
  }
}
