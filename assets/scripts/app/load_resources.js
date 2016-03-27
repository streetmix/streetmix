/**
 * load_resources
 *
 * Loads images, etc and tracks progress. (WIP)
 * TODO: Rely on Promises to resolve progress
 */
/* global _checkIfEverythingIsLoaded */

// Image tileset loading
// TODO: Deprecate in favor of inlined SVGs
const TILESET_IMAGE_VERSION = 55
const IMAGES_TO_BE_LOADED = [
  '/images/tiles-1.png',
  '/images/tiles-2.png',
  '/images/tiles-3.png',
  '/images/sky-front.png',
  '/images/sky-rear.png'
]

const SVGS_TO_BE_LOADED = [
  '/assets/images/icons.svg'
]

const SVGStagingEl = document.getElementById('svg')

let images = []
let loading = []

// Set loading bar
const loadingEl = document.getElementById('loading-progress')
loadingEl.max += 5 // Legacy; this is for other things that must load

// Global for legacy reasons
window.imagesToBeLoaded = 1

// Load everything
loadImages()
loadSVGs()

// When everything is loaded...
Promise.all(loading)
  .then(function () {
    // Export to window (LEGACY)
    window.images = images
    window.imagesToBeLoaded = 0

    // Also legacy, TODO: replace with promise
    _checkIfEverythingIsLoaded()
  })


function loadImages () {
  loadingEl.max += IMAGES_TO_BE_LOADED.length

  for (let url of IMAGES_TO_BE_LOADED) {
    loading.push(window.fetch(url + '?v' + TILESET_IMAGE_VERSION)
      .then(function (response) {
        return response.blob()
      })
      .then(function (image) {
        images[url] = document.createElement('img')
        images[url].src = url + '?v' + TILESET_IMAGE_VERSION

        loadingEl.value++
      })
      .catch(function (error) {
        console.error('loading image error', error)
      }))
  }
}

function loadSVGs () {
  loadingEl.max += SVGS_TO_BE_LOADED.length

  for (let url of SVGS_TO_BE_LOADED) {
    loading.push(window.fetch(url)
      .then(function (response) {
        return response.text()
      })
      .then(function (response) {
        SVGStagingEl.innerHTML += response
        loadingEl.value++
      })
      .catch(function (error) {
        console.error('loading svg error', error)
      }))
  }
}

export function hideLoadingScreen () {
  // NOTE:
  // This function might be called on very old browsers. Please make
  // sure not to use modern faculties.

  document.getElementById('loading').className += ' hidden'
}
