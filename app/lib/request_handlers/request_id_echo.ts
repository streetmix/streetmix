import type { NextFunction, Request, Response } from 'express'

export default function (req: Request, res: Response, next: NextFunction) {
  const requestId = req.header('X-Streetmix-Request-Id')

  if (requestId) {
    res.header('X-Streetmix-Request-Id', requestId)
  }

  next()
}
