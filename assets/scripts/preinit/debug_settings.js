/**
 * debug_settings
 *
 * Change the state of the application based on overrides
 * provided in the URL string. This is executed immediately
 * during the preinit stage, so it should depend on no
 * data, nor does it have access to any application state.
 * Later scripts may use these settings.
 *
 */

export const debug = {
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

const url = window.location.search

// TODO const
if (url.match(/[\?&]debug-hover-polygon&?/)) {
  debug.hoverPolygon = true
}

// TODO better
if (url.match(/[\?&]debug-canvas-rectangles&?/)) {
  debug.canvasRectangles = true
}

if (url.match(/[\?&]debug-force-left-hand-traffic&?/)) {
  debug.forceLeftHandTraffic = true
}

if (url.match(/[\?&]debug-force-metric&?/)) {
  debug.forceMetric = true
}

if (url.match(/[\?&]debug-force-unsupported-browser&?/)) {
  debug.forceUnsupportedBrowser = true
}

if (url.match(/[\?&]debug-force-non-retina&?/)) {
  debug.forceNonRetina = true
}

if (url.match(/[\?&]debug-secret-segments&?/)) {
  debug.secretSegments = true
}

if (url.match(/[\?&]debug-hover-polygon&?/)) {
  debug.hoverPolygon = true
}

if (url.match(/[\?&]debug-force-read-only&?/)) {
  debug.forceReadOnly = true
}

if (url.match(/[\?&]debug-force-touch&?/)) {
  debug.forceTouch = true
}

if (url.match(/[\?&]debug-force-live-update&?/)) {
  debug.forceLiveUpdate = true
}

if (url.match(/[\?&]debug-force-no-internet&?/)) {
  debug.forceNoInternet = true
}

if (url.match(/[\?&]debug-experimental&?/)) {
  debug.experimental = true
}
