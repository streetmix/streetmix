// This is a Mongo DB script
/* global db, emit */

var userIdMap = {}
db.users.find().forEach(function (u) {
  userIdMap[u._id] = u.id
})

var daysBetween = function (date1, date2) {
  // The number of milliseconds in one day
  var ONE_DAY = 1000 * 60 * 60 * 24

  // Convert both dates to milliseconds
  var date1Ms = date1.getTime()
  var date2Ms = date2.getTime()

  // Calculate the difference in milliseconds
  var differenceMs = Math.abs(date1Ms - date2Ms)

  // Convert the difference to days and return
  return Math.round(differenceMs / ONE_DAY)
}

var mapper = function () {
  emit(
    this._id,
    {
      'creator_id': this.creator_id,
      'namespaced_id': this.namespaced_id,
      'undo_stack_length': ((this.data && this.data.undoStack) ? this.data.undoStack.length : 0),
      'size_in_bytes': Object.bsonsize(this),
      'updated_at': this.updated_at
    }
  )
}

var reducer = function (key, values) { return { _id: key, size: values } }

var results = db.streets.mapReduce(mapper, reducer, { out: { 'inline': 1 } }).results

results.forEach(function (result) {
  var creator = '-'
  if (result.value.creator_id) {
    creator = userIdMap[result.value.creator_id]
  }

  var url = 'http://streetmix.net/' + creator + '/' + result.value.namespaced_id

  var updatedAtStr = (result.value.updated_at.getUTCMonth() + 1) +
    '/' + result.value.updated_at.getUTCDate() +
    '/' + result.value.updated_at.getUTCFullYear() +
    ' ' + result.value.updated_at.getUTCHours() +
    ':' + result.value.updated_at.getUTCMinutes() +
    ':' + result.value.updated_at.getUTCSeconds()

  print(
    result._id, '\t',
    result.value.size_in_bytes, '\t',
    updatedAtStr, '\t',
    daysBetween(new Date(), result.value.updated_at), '\t',
    result.value.undo_stack_length, '\t',
    result.value.creator_id, '\t',
    creator, '\t',
    result.value.namespaced_id, '\t',
    url
  )
})
