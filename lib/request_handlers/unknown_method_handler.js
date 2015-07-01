module.exports = function (req, res) {
  if (req.method.toLowerCase() === 'options') {
    var allowHeaders = ['Accept', 'Accept-Encoding', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'Authorization', 'Cache-Control' ]

    if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS')

    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Headers', allowHeaders.join(', '))
    res.header('Access-Control-Allow-Methods', res.methods.join(', '))
    res.header('Access-Control-Allow-Origin', req.headers.origin)

    return res.send(204)
  } else {
    return res.send('TODO: error')
  }
}
