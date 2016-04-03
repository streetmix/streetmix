/**
 * load_resources
 *
 * Loads images, etc and tracks progress. (WIP)
 * TODO: Rely on Promises to resolve progress
 */
/* global _checkIfEverythingIsLoaded */
const SVGStagingEl = document.getElementById('svg')

export let iconsSVG = window.fetch('/assets/images/icons.svg')
  .then(function (response) {
    return response.text()
  })
  .then(function (response) {
    SVGStagingEl.innerHTML = response
    return response
  })
  .catch(function (error) {
    console.log('doh', error)
  })

export function hideLoadingScreen () {
  // NOTE:
  // This function might be called on very old browsers. Please make
  // sure not to use modern faculties.

  document.getElementById('loading').className += ' hidden'
}

// Image tileset loading
// TODO: Deprecate in favor of inlined SVGs & loading by promises

const TILESET_IMAGE_VERSION = 55
const IMAGES_TO_BE_LOADED = [
  '/images/tiles-1.png',
  '/images/tiles-2.png',
  '/images/tiles-3.png',
  '/images/sky-front.png',
  '/images/sky-rear.png'
]

let images = []
let imagesToBeLoaded
// Global: TEMP
window.images = images
window.imagesToBeLoaded = imagesToBeLoaded

function loadImages () {
  imagesToBeLoaded = IMAGES_TO_BE_LOADED.length

  for (var i in IMAGES_TO_BE_LOADED) {
    var url = IMAGES_TO_BE_LOADED[i]

    images[url] = document.createElement('img')
    images[url].addEventListener('load', onImageLoaded)
    images[url].src = url + '?v' + TILESET_IMAGE_VERSION
  }

  document.querySelector('#loading-progress').value = 0
  document.querySelector('#loading-progress').max = imagesToBeLoaded + 5
}

function onImageLoaded () {
  imagesToBeLoaded--
  document.querySelector('#loading-progress').value++

  // Export to window (TEMP)
  // Doing this as an export one time did not work,
  // so we export to window each time loading occurs
  window.images = images
  window.imagesToBeLoaded = imagesToBeLoaded

  _checkIfEverythingIsLoaded()
}

loadImages()
