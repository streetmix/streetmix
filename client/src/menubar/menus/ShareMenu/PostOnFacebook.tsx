import { FormattedMessage } from 'react-intl'

import { useSelector } from '~/src/store/hooks.js'
import Icon from '~/src/ui/Icon.js'
import { FACEBOOK_APP_ID } from '~/src/app/config.js'
import { getPageTitle } from '~/src/app/page_title.js'
import MenuItem from '../MenuItem.js'
import type { SocialShareProps } from './helpers.js'

export function PostOnFacebook({ shareText, shareUrl }: SocialShareProps) {
  const street = useSelector((state) => state.street)

  const facebookLink =
    'https://www.facebook.com/dialog/feed' +
    '?app_id=' +
    encodeURIComponent(FACEBOOK_APP_ID ?? '') +
    '&redirect_uri=' +
    encodeURIComponent(shareUrl) +
    '&link=' +
    encodeURIComponent(shareUrl) +
    '&name=' +
    encodeURIComponent(getPageTitle(street)) +
    '&description=' +
    encodeURIComponent(shareText)

  return (
    <MenuItem href={facebookLink}>
      <Icon name="facebook" className="menu-item-icon" />
      <FormattedMessage
        id="menu.share.facebook"
        defaultMessage="Share using Facebook"
      />
    </MenuItem>
  )
}
