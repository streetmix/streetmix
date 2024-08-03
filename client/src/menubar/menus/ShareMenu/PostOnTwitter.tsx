import React from 'react'
import { FormattedMessage } from 'react-intl'

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
    <ExternalLink href={twitterLink} icon={true}>
      <Icon name="twitter" />
      <FormattedMessage
        id="menu.share.twitter"
        defaultMessage="Share using Twitter"
      />
    </ExternalLink>
  )
}

export default PostOnTwitter
