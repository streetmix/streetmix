import React, { forwardRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import copy from 'copy-to-clipboard'

import Button from '~/src/ui/Button'
import Icon from '~/src/ui/Icon'

interface CopyShareLinkProps {
  shareUrl: string
}

const CopyShareLink = forwardRef(
  (
    { shareUrl }: CopyShareLinkProps,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
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
            <Icon name="clipboard" />
          </Button>
        </div>
      </div>
    )
  }
)

export default CopyShareLink
