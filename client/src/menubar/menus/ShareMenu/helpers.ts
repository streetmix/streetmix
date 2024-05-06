import type { UserState } from '~/src/types'
import type { StreetState } from '@streetmix/types'
import type { IntlShape } from 'react-intl'

export interface SocialShareProps {
  shareText: string
  shareUrl: string
}

/**
 * Returns the current page URL.
 * This may eventually change to a short URL generator - strt.mx
 */
export function getSharingUrl (): string {
  return window.location.href
}

export function getSharingMessage (
  street: StreetState,
  user: UserState,
  intl: IntlShape
): string {
  const signedIn = user.signedIn ?? false
  const userId = user.signInData?.userId ?? ''
  let message = ''

  if (typeof street.creatorId === 'string') {
    if (signedIn && street.creatorId === userId) {
      if (typeof street.name === 'string') {
        message = intl.formatMessage(
          {
            id: 'menu.share.messages.my-street',
            defaultMessage: 'Check out my street, {streetName}, on Streetmix!'
          },
          { streetName: street.name }
        )
      } else {
        message = intl.formatMessage({
          id: 'menu.share.messages.my-street-unnamed',
          defaultMessage: 'Check out my street on Streetmix!'
        })
      }
    } else {
      if (typeof street.name === 'string') {
        message = intl.formatMessage(
          {
            id: 'menu.share.messages.someone-elses-street',
            defaultMessage:
              'Check out {streetName} by {streetCreator} on Streetmix!'
          },
          { streetName: street.name, streetCreator: `@${street.creatorId}` }
        )
      } else {
        message = intl.formatMessage(
          {
            id: 'menu.share.messages.someone-elses-street-unnamed',
            defaultMessage:
              'Check out this street by {streetCreator} on Streetmix!'
          },
          { streetCreator: `@${street.creatorId}` }
        )
      }
    }
  } else {
    if (typeof street.name === 'string') {
      message = intl.formatMessage(
        {
          id: 'menu.share.messages.anonymous-creator-street',
          defaultMessage: 'Check out {streetName} on Streetmix!'
        },
        { streetName: street.name }
      )
    } else {
      message = intl.formatMessage({
        id: 'menu.share.messages.anonymous-creator-street-unnamed',
        defaultMessage: 'Check out this street on Streetmix!'
      })
    }
  }

  return message
}
