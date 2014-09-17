function RandomGenerator() {
  this.randSeed = 0;
}

RandomGenerator.prototype.rand = function() {
  var t32 = 0x100000000;
  var constant = 134775813;
  var x = (constant * this.randSeed + 1);
  return (this.randSeed = x % t32) / t32;
}

RandomGenerator.prototype.seed = function(seed) {
  this.randSeed = seed;
}

function htmlEncode(value){
  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $('<div/>').text(value).html();
}


function msg(messageId, data) {
  if (data) {
    return MESSAGES[messageId].supplant(data);
  } else {
    return MESSAGES[messageId];
  }
}

String.prototype.supplant = function(o) {
  return this.replace(/\[\[([^\[\]]*)\]\]/g,
    function (a, b) {
      var r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    }
  );
};

function _createTimeout(fn, data, delay) {
  window.setTimeout(function() { fn.call(null, data); }, delay);
}

function _removeElFromDom(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

function _getElAbsolutePos(el) {
  var pos = [0, 0];

  do {
    pos[0] += el.offsetLeft + (el.cssTransformLeft || 0);
    pos[1] += el.offsetTop + (el.cssTransformTop || 0);

    el = el.offsetParent;
  } while (el);

  return pos;
}

function _clone(obj) {
  if ($.isArray(obj)) {
    return $.extend(true, [], obj);
  } else {
    return $.extend(true, {}, obj);
  }
}

function _isPointInPoly(vs, point) {
  var x = point[0], y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0], yi = vs[i][1];
    var xj = vs[j][0], yj = vs[j][1];

    var intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

function _generateRandSeed() {
  var randSeed = 1 + Math.floor(Math.random() * MAX_RAND_SEED); // So it’s not zero
  return randSeed;
}
