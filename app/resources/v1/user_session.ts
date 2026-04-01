import { logger } from '../../lib/logger.ts'

import type { Response } from 'express'
import type { Request as AuthedRequest } from 'express-jwt'

export async function del(req: AuthedRequest, res: Response) {
  // In order to sign out, make sure the user's session cookies
  // are part of the request.
  if (!req.auth) {
    res.status(400).json({ status: 400, msg: 'Must have user to logout.' })
    return
  }

  try {
    const cookieOptions = { maxAge: 0, sameSite: 'strict' as const }
    res.cookie('refresh_token', '', cookieOptions)
    res.cookie('login_token', '', cookieOptions)
    res.cookie('access_token', '', cookieOptions)
    res.status(204).end()
  } catch (err) {
    logger.error(err)
    res.status(500).json({ status: 500, msg: 'Error logging out user.' })
  }
}
