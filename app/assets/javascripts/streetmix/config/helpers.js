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
