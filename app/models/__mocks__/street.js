/* eslint-env jest */
const dummySequence = {
  _id: 'streets',
  '__v': 0,
  seq: 65
}

const dummyStreet = {
  _id: '5b06a6544a62a14ae7467e37',
  status: 'ACTIVE',
  id: '3e888ae0-5f48-11e8-82e7-c3447c17015a',
  creator_id: '5b031f6eaf47f2002',
  namespaced_id: 65,
  updated_at: '2018-05-24T11:47:33.041Z',
  created_at: '2018-05-24T11:47:32.721Z',
  __v: 0,
  data: { }
}

const save = function (cb) {
  return cb(null, {
    ...dummySequence,
    asJson
  })
}

const asJson = function (cb) {
  return cb(null, {
    ...dummyStreet,
    ...dummySequence
  })
}

const sort = function (option) {
  return {
    skip,
    limit,
    exec
  }
}

const skip = function (option) {
  return {
    skip,
    limit,
    exec
  }
}

const limit = function (option) {
  return {
    skip,
    limit,
    exec
  }
}

const exec = function (cb) {
  return cb(null, [{
    ...dummyStreet,
    save,
    asJson
  }])
}

function Model (_doc) {
  this._doc = _doc
  return {
    save
  }
}

Model.findByIdAndUpdate = function (query, operation, option, cb) {
  return cb(null, dummyStreet)
}

Model.findOne = function (query, cb) {
  return cb(null, {
    ...dummyStreet,
    save,
    asJson
  })
}

Model.find = function (query, cb) {
  if (cb) {
    return cb(null, [{
      ...dummyStreet,
      save
    }])
  }
  return {
    sort,
    skip,
    limit,
    exec
  }
}

Model.count = function (query, cb) {
  return cb(null, 1)
}

module.exports = Model
