exports.asStreetJson = function (street) {
  const json = {
    id: street.id,
    namespacedId: street.namespacedId,
    name: street.name,
    clientUpdatedAt: street.clientUpdatedAt,
    data: street.data,
    createdAt: street.createdAt,
    updatedAt: street.updatedAt,
    originalStreetId: street.originalStreetId
  }

  if (street.creatorId) {
    json.creator = { id: street.creatorId }
  }

  return json
}

exports.asUserJson = function (user) {
  const userJson = {
    id: user.id,
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

exports.ERRORS = {
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
  CANNOT_CREATE_USER: 'CANNOT_CREATE_USER',
  INVALID_EXTERNAL_LINK: 'INVALID_EXTERNAL_LINK'
}

exports.SAVE_THUMBNAIL_EVENTS = {
  INITIAL: 'INITIAL',
  SHARE: 'SHARE',
  TIMER: 'TIMER',
  BEFOREUNLOAD: 'BEFOREUNLOAD',
  PREVIOUS_STREET: 'PREVIOUS_STREET',
  TEST: 'TEST'
}

exports.requestIp = function (req) {
  if (req.headers['x-forwarded-for'] !== undefined) {
    return req.headers['x-forwarded-for'].split(', ')[0]
  } else {
    return req.connection.remoteAddress
  }
}
