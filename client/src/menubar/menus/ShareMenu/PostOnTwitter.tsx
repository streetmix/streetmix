import React from 'react'
import { FormattedMessage } from 'react-intl'

import Icon from '~/src/ui/Icon'
import MenuItem from '../MenuItem'
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
    <MenuItem href={twitterLink}>
      <Icon name="twitter" className="menu-item-icon" />
      <FormattedMessage
        id="menu.share.twitter"
        defaultMessage="Share using Twitter"
      />
    </MenuItem>
  )
}

export default PostOnTwitter
