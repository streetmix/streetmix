import type { Request, Response } from 'express'

import { User } from '../db/models/index.ts'

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

  const content =
    status === 404
      ? {
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
          profileImageUrl: user?.profileImageUrl,
          profileImageMimeType:
            user?.profileImageUrl?.toLowerCase().endsWith('.jpg') === true ||
            user?.profileImageUrl?.toLowerCase().endsWith('.jpeg') === true
              ? 'image/jpeg'
              : 'image/png',
        }
      : {
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
          profileImageUrl: user?.profileImageUrl,
          profileImageMimeType:
            user?.profileImageUrl?.toLowerCase().endsWith('.jpg') === true ||
            user?.profileImageUrl?.toLowerCase().endsWith('.jpeg') === true
              ? 'image/jpeg'
              : 'image/png',
        }

  res.status(status).render('error', content)
}
