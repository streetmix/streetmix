'use strict'

if (debug.hoverPolygon) {
  createDebugHoverPolygon()
}

function createDebugHoverPolygon () {
  var el = document.createElement('div')
  el.id = 'debug-hover-polygon'
  document.body.appendChild(el)

  var canvasEl = document.createElement('canvas')
  canvasEl.width = window.innerWidth
  canvasEl.height = window.innerHeight
  el.appendChild(canvasEl)
}
