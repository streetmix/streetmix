import React from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector } from '~/src/store/hooks'
import Icon from '~/src/ui/Icon'
import ExternalLink from '~/src/ui/ExternalLink'
import { FACEBOOK_APP_ID } from '~/src/app/config'
import { getPageTitle } from '~/src/app/page_title'
import type { SocialShareProps } from './helpers'

function PostOnFacebook ({
  shareText,
  shareUrl
}: SocialShareProps): React.ReactElement {
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
    <ExternalLink href={facebookLink} icon={true}>
      <Icon name="facebook" />
      <FormattedMessage
        id="menu.share.facebook"
        defaultMessage="Share using Facebook"
      />
    </ExternalLink>
  )
}

export default PostOnFacebook
