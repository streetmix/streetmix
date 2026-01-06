import { FormattedMessage } from 'react-intl'

import Icon from '~/src/ui/Icon.js'
import { MenuItem } from '../MenuItem.js'
import type { SocialShareProps } from './helpers.js'

const LS_SHARE_MASTODON = 'share:mastodon-domain'
const MASTODON_DEFAULT_DOMAIN = 'mastodon.social'

function handleShareToMastodon(shareText: string, shareUrl: string): void {
  // Get the Mastodon domain. User might have specified one in localstorage,
  // so use it if specified, otherwise use the "main" Mastodon instance
  const domain = window.prompt(
    'Enter your Mastodon instance domain',
    window.localStorage.getItem(LS_SHARE_MASTODON) ?? MASTODON_DEFAULT_DOMAIN
  )

  // Remember the value for later, because a person is likely to be
  // using the same instance for every share
  try {
    if (domain !== null) {
      window.localStorage.setItem(LS_SHARE_MASTODON, domain)
    } else {
      window.localStorage.removeItem(LS_SHARE_MASTODON)
    }
  } catch (err) {
    // Catch and continue if there is an error
    console.error(`Error writing to ${LS_SHARE_MASTODON} on localStorage`)
  }

  // Bail if we don't have a domain
  if (domain === null) return

  // Build the URL
  const url =
    'https://' +
    encodeURIComponent(domain) +
    '/share?text=' +
    encodeURIComponent(shareText) +
    '&url=' +
    encodeURIComponent(shareUrl)

  // Open a window on the share page
  window.open(url, '_blank')
}

export function PostOnMastodon({ shareText, shareUrl }: SocialShareProps) {
  return (
    <MenuItem
      onClick={() => {
        handleShareToMastodon(shareText, shareUrl)
      }}
    >
      <Icon name="mastodon" className="menu-item-icon" />
      <FormattedMessage
        id="menu.share.mastodon"
        defaultMessage="Share using Mastodon"
      />
      <Icon name="external-link" />
    </MenuItem>
  )
}
