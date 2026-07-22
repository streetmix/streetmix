import { logger } from '../logger.ts'

import type { NextFunction, Request, Response } from 'express'

export default function (req: Request, res: Response, next: NextFunction) {
  const contentType = req.headers['content-type'] || ''

  logger.debug({
    method: req.method,
    url: req.url,
    content_type: contentType,
    user_id: req.cookies.user_id,
  })

  next()
}
