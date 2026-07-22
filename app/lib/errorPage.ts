import type { Request, Response } from 'express'

import { User } from '../db/models/index.ts'

export function serveErrorPage(
  req: Request,
  res: Response,
  status: 404 | 410,
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
          // In the client app we have special conditions for 404 - no page here
          // and 404 - no street here with an option to display a link to other
          // streets by the same user, if present.
          // I think we can just use a call to action button or link for this
          // rather than doubling up on translations in the future.
          message: 'We couldn’t find this page anywhere we looked.',
          returnButton: 'Return to Streetmix',
          userId: user ? user.id : null,
          user: user
            ? `View other streets by ${user.displayName ?? user.id}`
            : undefined,
        }
      : {
          lang: 'en',
          errorCode: 410,
          title: 'Gone (Error 410)',
          heading: 'This street has been deleted.',
          message: 'We can’t display something that no longer exists!',
          // In the client app we have special conditions where we can direct
          // someone to view other streets by the same user, if present.
          returnButton: 'Return to Streetmix',
          userId: user ? user.id : null,
          user: user
            ? `View other streets by ${user.displayName ?? user.id}`
            : undefined,
        }

  res.status(status).render('error', content)
}
