import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import copy from 'copy-to-clipboard'

import { Button } from '~/src/ui/Button.js'
import { Icon } from '~/src/ui/Icon.js'
import { Tooltip } from '~/src/ui/Tooltip.js'

interface CopyShareLinkProps {
  shareUrl: string
  ref: React.ForwardedRef<HTMLInputElement>
}

export function CopyShareLink({ shareUrl, ref }: CopyShareLinkProps) {
  const [hasCopied, setHasCopied] = useState(false)
  const intl = useIntl()

  const label = hasCopied
    ? intl.formatMessage({
        id: 'menu.share.copy-success',
        defaultMessage: 'Copied!',
      })
    : intl.formatMessage({
        id: 'menu.share.copy-to-clipboard',
        defaultMessage: 'Copy to clipboard',
      })

  async function handleClick(_event: React.MouseEvent) {
    try {
      await copy(shareUrl)
      setHasCopied(true)
    } catch (err) {
      console.error('clipboard copy error')
    }
  }

  // Resets copied state after copying, and element loses focus.
  // Do it after the tooltip animation timing so that text doesn't change when
  // animating out
  function resetState() {
    if (hasCopied) {
      window.setTimeout(() => {
        setHasCopied(false)
      }, 150)
    }
  }

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
        <Tooltip label={label}>
          <Button
            onClick={handleClick}
            onBlur={resetState}
            onMouseLeave={resetState}
          >
            <Icon name="clipboard" size="16" />
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}
