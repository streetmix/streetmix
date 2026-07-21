import type { Request, Response } from 'express'

export function serveErrorPage(req: Request, res: Response, status: 404 | 410) {
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
          pageTitle: 'Not found (Error 404)',
          header: 'Oops!',
          message: 'We can‘t display this page because it doesn’t exist.',
          returnButton: 'Return to Streetmix',
        }
      : {
          lang: 'en',
          errorCode: 410,
          pageTitle: 'Gone (Error 410)',
          header: 'Oops!',
          message: 'We can’t display this page because it was deleted.',
          returnButton: 'Return to Streetmix',
        }

  res.status(status).render('error', content)
}
