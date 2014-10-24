exports.parseLoginToken = function(req) {

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
  for (authParamIndex in auth) {

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

    } // END switch

  } // END for

  if ((authScheme != 'Streetmix') || (realm != '')) {
    return null
  }

  return loginToken

} // END function - exports.getLoginToken
