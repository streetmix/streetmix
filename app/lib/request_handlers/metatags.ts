import axios from 'axios'

import { Street, User } from '../../db/models/index.ts'
import { logger } from '../logger.ts'
import { appURL } from '../url.ts'

import type { NextFunction, Request, Response } from 'express'

const ANON_CREATOR = '-'

// This file is a work in progress.
// It was originally meant to find metadata to insert into metatags when a URL
// is crawled/linked to for unfurls. But we can also expand this to be useful.
// If a street is not found at this step, we can render static error pages
// which is also better than letting the client handle it.

// TODO: serve 500 errors when this fails. Error handling in this is broken
async function findUser(userId: string) {
  let user

  try {
    user = await User.findOne({ where: { id: userId } })
  } catch (error) {
    throw new Error('Error finding user.', { cause: error })
  }

  return user
}

async function findStreet(user: User | null, namespacedId: string) {
  return Street.findOne({
    where: { creatorId: user ? user.id : null, namespacedId },
  })
}

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.params.user_id
  const namespacedId = req.params.namespacedId

  if (!userId || !namespacedId) {
    next()
  }

  // 1a) Find street using user.id and namespacedId.
  // 1b) Find street using namespacedId (if anon creator).
  // 2) Find street thumbnail using street.id
  // 3) Set res.locals.STREETMIX_TITLE if street found
  // 4) Set res.locals.STREETMIX_IMAGE if thumbnail found

  const handleFindStreet = async function (
    street: Street | null,
    user: User | null
  ) {
    if (!street) {
      throw new Error('Street not found.')
    }

    // Returns 410 Gone for deleted streets
    if (street.status === 'DELETED') {
      next({ status: 410, user })
      return
    }

    const streetName = street.name || 'Unnamed Street'
    const title = `${streetName} - Streetmix`

    res.locals.STREETMIX_TITLE = title
    res.locals.STREETMIX_URL += `${userId}/${namespacedId}/`

    // If street is a DEFAULT_STREET or EMPTY_STREET, the public id for the
    // street thumbnail is the street type, not the street id.
    const streetData = street.data && street.data.street
    let streetId
    if (streetData && streetData.editCount === 0) {
      streetId = streetData.segments.length ? 'DEFAULT_STREET' : 'EMPTY_STREET'
    } else {
      streetId = street.id
    }

    const endpoint = `${appURL.origin}/api/v1/streets/${streetId}/image/`

    try {
      const response = await axios.get(endpoint)
      const results = response.data
      if (results && results.secure_url) {
        res.locals.STREETMIX_IMAGE = {
          image: results.secure_url,
          width: results.width,
          height: results.height,
        }
      }
    } catch (error) {
      // 404 is expected — most streets don't have thumbnails yet
      if (error.response?.status !== 404) {
        logger.error(error)
      }
    }

    next()
  }

  let user
  if (userId === ANON_CREATOR) {
    user = null
  } else {
    user = await findUser(userId)

    // If a userId is given, but not found, serve a 404
    if (!user) {
      next({ status: 404 })
      return
    }
  }

  try {
    const street = await findStreet(user, namespacedId)
    await handleFindStreet(street, user)
  } catch (err) {
    next({ status: 404, user })
  }
}
