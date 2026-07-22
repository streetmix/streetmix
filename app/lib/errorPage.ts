import type { Request, Response } from 'express'
import type { User } from '../db/models/index.ts'

function getProfileImageMimeType(url?: string) {
  // If no url provided, mime type is the placeholder SVG
  if (!url) {
    return 'image/svg+xml'
  }

  if (
    url.toLowerCase().endsWith('.jpg') ||
    url.toLowerCase().endsWith('.jpeg')
  ) {
    return 'image/jpeg'
  }

  // Default: naively assume png
  return 'image/png'
}

export function serveErrorPage(
  req: Request,
  res: Response,
  status: 404 | 410 | 500,
  user?: User | null
) {
  // TODO: Also get content based on language from Accept-Languages header
  // We could export a convenience function from i18n of all supported
  // languages, then acceptsLanguages() will automatically select the most
  // appropriate one from the list
  // For now just log requested language for inspection
  // const lang = req.acceptsLanguages() || 'en'

  let content

  switch (status) {
    case 404: {
      content = {
        lang: 'en',
        errorCode: 404,
        title: 'Not found (Error 404)',
        heading: 'There’s nothing here!',
        message: 'We couldn’t find this page anywhere we looked.',
        returnButton: 'Return to Streetmix',

        // If a User is passed here, we attempted to look up a street for
        // an existing user. We can add a link to redirect a viewer to the
        // user's street gallery.
        userId: user ? user.id : null,
        userName: user ? (user.displayName ?? user.id) : undefined,
        userRedirect: 'View other streets by {user}',
        profileImageUrl: user?.profileImageUrl ?? '/images/avatar.svg',
        profileImageMimeType: getProfileImageMimeType(user?.profileImageUrl),
      }
      break
    }
    case 410: {
      content = {
        lang: 'en',
        errorCode: 410,
        title: 'Gone (Error 410)',
        heading: 'This street has been deleted.',
        message: 'We can’t display something that no longer exists!',
        returnButton: 'Return to Streetmix',

        // If a User is passed here, we attempted to look up a street for
        // an existing user. We can add a link to redirect a viewer to the
        // user's street gallery.
        userId: user ? user.id : null,
        userName: user ? (user.displayName ?? user.id) : undefined,
        userRedirect: 'View other streets by {user}',
        profileImageUrl: user?.profileImageUrl ?? '/images/avatar.svg',
        profileImageMimeType: getProfileImageMimeType(user?.profileImageUrl),
      }
      break
    }
    case 500:
    default:
      content = {
        lang: 'en',
        errorCode: 500,
        title: 'Internal server error (Error 500)',
        heading: 'Something went wrong.',
        message:
          'The server encountered a problem. Hopefully it’s temporary. Please try again later.',
      }

      break
  }

  res.status(status).render('error', content)
}
