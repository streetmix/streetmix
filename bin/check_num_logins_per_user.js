// This is a Mongo DB script

var mapper = function() {
  var length = 0
  if (this.data && this.data.street && this.data.street.segments) {
    length = this.data.street.segments.length
  }
  emit(length, 1)
}

var reducer = function(key, values) {
  return values.length //{ _id: key, value: values.length }
}

printjson(db.streets.mapReduce(mapper, reducer, { out: { 'inline': 1 } }).results)
