/* eslint-env jest */
const userDummy = {
  login_tokens: [ '133e5110-5d2e-11e8-a8fd-678b57961690' ],
  _id: '5b031f6eaf47f2002',
  id: 'oluwaseun',
  twitter_id: '438',
  twitter_credentials: {
    access_token_key: 'fooofofoooofooo-2f',
    access_token_secret: 'foofooofoofooofooofoo-sf'
  },
  updated_at: '2018-05-22T14:18:09.853Z',
  created_at: '2018-05-21T19:35:10.807Z',
  roles: []
}

const save = function (cb) {
  if (cb) {
    return cb(null, userDummy)
  }
  return Promise.resolve(userDummy)
}

const asJson = function (option, cb) {
  return cb(null, userDummy)
}

function Model (_doc) {
  this._doc = _doc
  return {
    save
  }
}

Model.findOne = function (option, cb) {
  if (cb) {
    cb(null, {
      ...userDummy,
      save,
      asJson
    })
    return
  }
  return Promise.resolve({
    ...userDummy,
    save,
    asJson
  })
}

Model.count = function (option, cb) {
  if (cb) {
    cb(null, 0)
  }
  return Promise.resolve(0)
}

Model.findByIdAndUpdate = function (option, cb) {
  cb(null, {
    ...userDummy,
    save,
    asJson
  })
}

module.exports = Model
