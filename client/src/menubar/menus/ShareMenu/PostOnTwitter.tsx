import { FormattedMessage } from 'react-intl'

import Icon from '~/src/ui/Icon.js'
import { MenuItem } from '../MenuItem.js'
import type { SocialShareProps } from './helpers.js'

export function PostOnTwitter({ shareText, shareUrl }: SocialShareProps) {
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
