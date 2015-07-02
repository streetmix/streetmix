var debug = {
  hoverPolygon: false,
  canvasRectangles: false,
  forceLeftHandTraffic: false,
  forceMetric: false,
  forceUnsupportedBrowser: false,
  forceNonRetina: false,
  forceNoInternet: false,
  secretSegments: false,
  experimental: false
}

function _detectDebugUrl () {
  var url = location.href

  // TODO const
  if (url.match(/[\?\&]debug-hover-polygon\&?/)) {
    debug.hoverPolygon = true

    var el = document.createElement('div')
    el.id = 'debug-hover-polygon'
    document.body.appendChild(el)

    var canvasEl = document.createElement('canvas')
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    el.appendChild(canvasEl)
  }

  // TODO better
  if (url.match(/[\?\&]debug-canvas-rectangles\&?/)) {
    debug.canvasRectangles = true
  }

  if (url.match(/[\?\&]debug-force-left-hand-traffic\&?/)) {
    debug.forceLeftHandTraffic = true
  }

  if (url.match(/[\?\&]debug-force-metric\&?/)) {
    debug.forceMetric = true
  }

  if (url.match(/[\?\&]debug-force-unsupported-browser\&?/)) {
    debug.forceUnsupportedBrowser = true
  }

  if (url.match(/[\?\&]debug-force-non-retina\&?/)) {
    debug.forceNonRetina = true
  }

  if (url.match(/[\?\&]debug-secret-segments\&?/)) {
    debug.secretSegments = true
  }

  if (url.match(/[\?\&]debug-hover-polygon\&?/)) {
    debug.hoverPolygon = true
  }

  if (url.match(/[\?\&]debug-force-read-only\&?/)) {
    debug.forceReadOnly = true
  }

  if (url.match(/[\?\&]debug-force-touch\&?/)) {
    debug.forceTouch = true
  }

  if (url.match(/[\?\&]debug-force-live-update\&?/)) {
    debug.forceLiveUpdate = true
  }

  if (url.match(/[\?\&]debug-force-no-internet\&?/)) {
    debug.forceNoInternet = true
  }

  if (url.match(/[\?\&]debug-experimental\&?/)) {
    debug.experimental = true
  }
}
