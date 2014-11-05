var debug = {
  hoverPolygon: false,
  canvasRectangles: false,
  forceLeftHandTraffic: false,
  forceMetric: false,
  forceUnsupportedBrowser: false,
  forceNonRetina: false,
  secretSegments: false,
  experimental: false
};

function _hideDebugInfo() {
  document.querySelector('#debug').classList.remove('visible');
}

function _showDebugInfo() {
  var debugStreetData = _clone(street);
  var debugUndo = _clone(undoStack);
  var debugSettings = _clone(settings);

  for (var i in debugStreetData.segments) {
    delete debugStreetData.segments[i].el;
  }

  for (var j in debugUndo) {
    for (var i in debugUndo[j].segments) {
      delete debugUndo[j].segments[i].el;
    }
  }

  var debugText =
      'DATA:\n' + JSON.stringify(debugStreetData, null, 2) +
      '\n\nSETTINGS:\n' + JSON.stringify(debugSettings, null, 2) +
      '\n\nUNDO:\n' + JSON.stringify(debugUndo, null, 2);

  document.querySelector('#debug').classList.add('visible');
  document.querySelector('#debug > textarea').innerHTML = debugText;
  document.querySelector('#debug > textarea').focus();
  document.querySelector('#debug > textarea').select();
  event.preventDefault();
}

function _detectDebugUrl() {
  var url = location.href;

  // TODO const
  if (url.match(/[\?\&]debug-hover-polygon\&?/)) {
    debug.hoverPolygon = true;

    var el = document.createElement('div');
    el.id = 'debug-hover-polygon';
    document.body.appendChild(el);

    var canvasEl = document.createElement('canvas');
    canvasEl.width = window.innerWidth;
    canvasEl.height = window.innerHeight;
    el.appendChild(canvasEl);
  }

  // TODO better
  if (url.match(/[\?\&]debug-canvas-rectangles\&?/)) {
    debug.canvasRectangles = true;
  }

  if (url.match(/[\?\&]debug-force-left-hand-traffic\&?/)) {
    debug.forceLeftHandTraffic = true;
  }

  if (url.match(/[\?\&]debug-force-metric\&?/)) {
    debug.forceMetric = true;
  }

  if (url.match(/[\?\&]debug-force-unsupported-browser\&?/)) {
    debug.forceUnsupportedBrowser = true;
  }

  if (url.match(/[\?\&]debug-force-non-retina\&?/)) {
    debug.forceNonRetina = true;
  }

  if (url.match(/[\?\&]debug-secret-segments\&?/)) {
    debug.secretSegments = true;
  }

  if (url.match(/[\?\&]debug-hover-polygon\&?/)) {
    debug.hoverPolygon = true;
  }

  if (url.match(/[\?\&]debug-force-read-only\&?/)) {
    debug.forceReadOnly = true;
  }

  if (url.match(/[\?\&]debug-force-touch\&?/)) {
    debug.forceTouch = true;
  }

  if (url.match(/[\?\&]debug-force-live-update\&?/)) {
    debug.forceLiveUpdate = true;
  }

  if (url.match(/[\?\&]debug-experimental\&?/)) {
    debug.experimental = true;
  }
}
