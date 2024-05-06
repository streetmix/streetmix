import React from 'react'
import { FormattedMessage } from 'react-intl'
import { ExternalLinkIcon } from '@radix-ui/react-icons'

import Icon from '~/src/ui/Icon'
import ExternalLink from '~/src/ui/ExternalLink'
import type { SocialShareProps } from './helpers'

function PostOnTwitter ({
  shareText,
  shareUrl
}: SocialShareProps): React.ReactElement {
  const twitterLink =
    'https://twitter.com/intent/tweet' +
    '?text=' +
    encodeURIComponent(shareText) +
    '&url=' +
    encodeURIComponent(shareUrl)

  return (
    <ExternalLink href={twitterLink}>
      <Icon icon="twitter" className="menu-item-icon" />
      <FormattedMessage
        id="menu.share.twitter"
        defaultMessage="Share using Twitter"
      />
      <ExternalLinkIcon className="menu-item-external-link" />
    </ExternalLink>
  )
}

export default PostOnTwitter
