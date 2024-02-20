// https://www.jacklmoore.com/notes/rounding-in-javascript/
function round (value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
}

export function asStreetJson (street) {
  const json = {
    id: street.id,
    namespacedId: street.namespacedId,
    name: street.name,
    clientUpdatedAt: street.clientUpdatedAt,
    data: street.data,
    createdAt: street.createdAt,
    updatedAt: street.updatedAt,
    originalStreetId: street.originalStreetId,
    creatorId: street.creatorId
  }

  // Deprecated creator id, do not use.
  if (street.creatorId) {
    json.creator = { id: street.creatorId }
  }

  // TEMPORARY! TEST! LET'S DO METRICATION!
  // If units = 2 (metric) convert with orig precision
  // if schemaVersion already 30, that means this was already done
  if (json.data.street.schemaVersion < 30) {
    const data = json.data.street
    if (json.data.street.units === 2) {
      // Use imprecise (original) conversion rate to metric
      const conversion = 0.3

      // Convert street width to metric
      data.width = round(data.width * conversion, 3)

      // Convert segment widths to metric
      for (let i = 0; i < data.segments.length; i++) {
        const segment = data.segments[i]
        segment.width = round(segment.width * conversion, 3)
      }

      // Set new units value
      data.units = 0
    } else {
      // Use precise conversion to metric
      const conversion = 0.3048

      // Convert street width to metric
      data.width = round(data.width * conversion, 3)

      // Convert segment widths to metric
      for (let i = 0; i < data.segments.length; i++) {
        const segment = data.segments[i]
        segment.width = round(segment.width * conversion, 3)
      }
    }

    // Mock update to schema version
    json.data.street.schemaVersion = 30
  }

  return json
}

export function asUserJson (user) {
  const userJson = {
    id: user.id,
    displayName: user.displayName || null,
    profileImageUrl: user.profileImageUrl,
    flags: user.flags || {},
    roles: user.roles || [],
    data: user.data || {}
  }

  userJson.roles = userJson.roles || []
  if (!userJson.roles.includes('USER')) {
    // Also, make USER appear first in the list consistently
    userJson.roles.unshift('USER')
  }

  return userJson
}

export function asUserJsonBasic (user) {
  const userJson = {
    id: user.id,
    displayName: user.displayName || null,
    profileImageUrl: user.profileImageUrl
  }

  return userJson
}

export const ERRORS = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  STREET_NOT_FOUND: 'STREET_NOT_FOUND',
  STREET_DELETED: 'STREET_DELETED',
  UNAUTHORISED_ACCESS: 'UNAUTHORISED_ACCESS',
  FORBIDDEN_REQUEST: 'FORBIDDEN_REQUEST',
  CANNOT_CREATE_STREET: 'CANNOT_CREATE_STREET',
  CANNOT_UPDATE_STREET: 'CANNOT_UPDATE_STREET',
  CANNOT_GET_STREET: 'CANNOT_GET_STREET',
  CANNOT_GET_USER: 'CANNOT_GET_USER',
  CANNOT_CREATE_USER: 'CANNOT_CREATE_USER'
}

export const SAVE_THUMBNAIL_EVENTS = {
  INITIAL: 'INITIAL',
  SHARE: 'SHARE',
  TIMER: 'TIMER',
  BEFOREUNLOAD: 'BEFOREUNLOAD',
  PREVIOUS_STREET: 'PREVIOUS_STREET',
  TEST: 'TEST'
}

export function requestIp (req) {
  if (req.headers['x-forwarded-for'] !== undefined) {
    return req.headers['x-forwarded-for'].split(', ')[0]
  } else {
    return req.connection.remoteAddress
  }
}
