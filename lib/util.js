exports.parseLoginToken = function (req) {
  var authHeader = req.header('Authorization')

  if (!authHeader) {
    return null
  }

  var auth = authHeader.split(/\s+/)

  if (auth.length < 3) {
    return null
  }

  var authScheme = auth.shift()
  var realm, loginToken

  for (var authParamIndex in auth) {
    var authParam = auth[authParamIndex]
    var kv = authParam.split('=')
    var authParamKey = kv[0]
    var authParamValue = kv[1]

    switch (authParamKey) {
      case 'realm':
        realm = authParamValue.replace(/(^"|"$)/g, '')
        break
      case 'loginToken':
        loginToken = authParamValue.replace(/(^"|"$)/g, '')
        break
    }
  }

  if ((authScheme !== 'Streetmix') || (realm !== '')) {
    return null
  }

  return loginToken
}

exports.ERRORS = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  STREET_NOT_FOUND: 'STREET_NOT_FOUND',
  STREET_DELETED: 'STREET_DELETED',
  UNAUTHORISED_ACCESS: 'UNAUTHORISED_ACCESS',
  FORBIDDEN_REQUEST: 'FORBIDDEN_REQUEST',
  CANNOT_CREATE_STREET: 'CANNOT_CREATE_STREET'
}
