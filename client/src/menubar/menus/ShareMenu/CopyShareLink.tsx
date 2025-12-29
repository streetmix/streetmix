import { FormattedMessage, useIntl } from 'react-intl'
import copy from 'copy-to-clipboard'

import { Button } from '~/src/ui/Button.js'
import Icon from '~/src/ui/Icon.js'

interface CopyShareLinkProps {
  shareUrl: string
  ref: React.ForwardedRef<HTMLInputElement>
}

export function CopyShareLink({ shareUrl, ref }: CopyShareLinkProps) {
  const intl = useIntl()

  return (
    <div className="share-via-link-container">
      <Icon name="link" className="menu-item-icon" />
      <FormattedMessage
        id="menu.share.link"
        defaultMessage="Copy and paste this link to share:"
      />
      <div className="share-via-link-form">
        <input
          className="share-via-link"
          type="text"
          value={shareUrl}
          spellCheck="false"
          ref={ref}
          readOnly
        />
        <Button
          title={intl.formatMessage({
            id: 'menu.share.copy-to-clipboard',
            defaultMessage: 'Copy to clipboard',
          })}
          onClick={(event) => {
            event.preventDefault()
            copy(shareUrl)
          }}
        >
          <Icon name="clipboard" size="16" />
        </Button>
      </div>
    </div>
  )
}
