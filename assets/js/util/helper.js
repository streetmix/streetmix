
// Replace with _.cloneDeep (via lodash)
function _clone (obj) {
  if ($.isArray(obj)) {
    return $.extend(true, [], obj)
  } else {
    return $.extend(true, {}, obj)
  }
}

function _isPointInPoly (vs, point) {
  var x = point[0], y = point[1]

  var inside = false
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0], yi = vs[i][1]
    var xj = vs[j][0], yj = vs[j][1]

    var intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }

  return inside
}

function _normalizeSlug (slug) {
  slug = slug.toLowerCase()
  slug = slug.replace(/ /g, '-')
  slug = slug.replace(/-{2,}/, '-')
  slug = slug.replace(/[^a-zA-Z0-9\-]/g, '')
  slug = slug.replace(/^[-]+|[-]+$/g, '')

  return slug
}
