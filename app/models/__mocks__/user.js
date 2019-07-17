/* eslint-env jest */
const mockUsers = {
  user1: {
    login_tokens: [ 'xxxxxxxx-xxxx-xxxx-xxxx-1111111111111' ],
    _id: '1',
    id: 'user1',
    last_street_id: '3e888ae0-5f48-11e8-82e7-c3447c17015a',
    twitter_id: '1',
    twitter_credentials: {
      access_token_key: 'fooofofoooofooo-11',
      access_token_secret: 'foofooofoofooofooofoo-11'
    },
    updated_at: '2018-05-22T14:18:09.853Z',
    created_at: '2018-05-21T19:35:10.807Z',
    roles: []
  },
  user2: {
    login_tokens: [ 'xxxxxxxx-xxxx-xxxx-xxxx-2222222222222' ],
    _id: '2',
    id: 'user2',
    twitter_id: '2',
    twitter_credentials: {
      access_token_key: 'fooofofoooofooo-22',
      access_token_secret: 'foofooofoofooofooofoo-22'
    },
    updated_at: '2018-05-22T14:18:09.853Z',
    created_at: '2018-05-21T19:35:10.807Z',
    roles: []
  },
  admin: {
    login_tokens: [ 'xxxxxxxx-xxxx-xxxx-xxxx-3333333333333' ],
    _id: '3',
    id: 'admin',
    twitter_id: '3',
    twitter_credentials: {
      access_token_key: 'fooofofoooofooo-33',
      access_token_secret: 'foofooofoofooofooofoo-33'
    },
    updated_at: '2018-05-22T14:18:09.853Z',
    created_at: '2018-05-21T19:35:10.807Z',
    roles: [ 'ADMIN' ]
  }
}

const makeSaveFunction = (mockUser) => {
  return (cb) => {
    if (cb) {
      return cb(null, mockUser)
    }

    return Promise.resolve(mockUser)
  }
}

const makeAsJsonFunction = (mockUser) => {
  return (option, cb) => {
    return cb(null, mockUser)
  }
}

function Model (_doc) {
  this._doc = _doc

  return {
    save: makeSaveFunction(_doc)
  }
}

Model.findOne = function (option, cb) {
  const mockUser = mockUsers[option.id] || mockUsers['user1']

  if (cb) {
    cb(null, {
      ...mockUser,
      save: makeSaveFunction(mockUser),
      asJson: makeAsJsonFunction(mockUser)
    })
    return
  }

  return Promise.resolve({
    ...mockUser,
    save: makeSaveFunction(mockUser),
    asJson: makeAsJsonFunction(mockUser)
  })
}

Model.count = function (option, cb) {
  if (cb) {
    cb(null, 0)
  }

  return Promise.resolve(0)
}

Model.deleteOne = function (option, cb) {
  const mockUser = mockUsers[option.id] || mockUsers['user1']

  if (cb) {
    cb(null, mockUser)
  }

  return Promise.resolve(mockUser)
}

Model.find = function (option) {
  const users = Object.entries(mockUsers).map((user) => {
    const mockUser = user[1]

    return {
      ...mockUser,
      save: makeSaveFunction(mockUser),
      asJson: makeAsJsonFunction(mockUser)
    }
  })

  return Promise.resolve(users)
}

Model.findByIdAndUpdate = function (option) {
  const mockUser = mockUsers[option.id] || mockUsers['user1']

  return Promise.resolve({
    ...mockUser,
    save: makeSaveFunction(mockUser),
    asJson: makeAsJsonFunction(mockUser)
  })
}

module.exports = Model
