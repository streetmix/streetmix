exports.parseLoginToken = function (req) {
  // authHeader is a string that looks like this:
  // `Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx" userId="user"`
  const authHeader = req.header('Authorization')

  if (!authHeader) {
    return null
  }

  const auth = authHeader.split(/\s+/)

  if (auth.length < 4) {
    return null
  }

  const authScheme = auth.shift()

  // Convert the auth string to an object
  const authObject = auth.reduce((accumulator, item) => {
    const [ key, value ] = item.split('=')
    accumulator[key] = value.replace(/(^"|"$)/g, '')
    return accumulator
  }, {})

  if ((authScheme !== 'Streetmix') || (authObject.realm !== '')) {
    return null
  }

  return authObject
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
  CANNOT_GET_USER: 'CANNOT_GET_USER'
}

exports.requestIp = function (req) {
  if (req.headers['x-forwarded-for'] !== undefined) {
    return req.headers['x-forwarded-for'].split(', ')[0]
  } else {
    return req.connection.remoteAddress
  }
}
