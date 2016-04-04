/**
 * load_resources
 *
 * Loads images, etc and tracks progress. (WIP)
 * TODO: Rely on Promises to resolve progress
 */
/* global _checkIfEverythingIsLoaded, Image */

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
    loading.push(getImage(url + '?v' + TILESET_IMAGE_VERSION)
      .then(function (image) {
        // Store on the global images object, using the url as the key
        images[url] = image

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

/**
 * Wraps `new Image()`'s onload and onerror properties with
 * Promises. This provides a more reliable way of knowing when a
 * image element is done loading (rather than fetch) because a
 * fetch can successfully load an image file but be resolved
 * before the image element is ready. So we must resolve only after
 * the image's `onload` callback has been called.
 */
function getImage (url) {
  return new Promise(function (resolve, reject) {
    var img = new Image()
    img.onload = function () {
      resolve(img)
    }
    img.onerror = function () {
      reject('unable to load image ' + url)
    }
    img.src = url
  })
}

export function hideLoadingScreen () {
  // NOTE:
  // This function might be called on very old browsers. Please make
  // sure not to use modern faculties.

  document.getElementById('loading').className += ' hidden'
}
