/* eslint-env jest */

const dummySequence = {
  _id: 'streets',
  '__v': 0,
  seq: 65
}

const save = function (cb) {
  return cb(null, dummySequence)
}

function Model (_doc) {
  this._doc = _doc
}

Model.findByIdAndUpdate = function (query, operation, option) {
  return Promise.resolve({
    ...dummySequence,
    save
  })
}

module.exports = Model
