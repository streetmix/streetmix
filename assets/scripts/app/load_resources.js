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
  '/assets/images/icons.svg',
  '/assets/images/images.svg'
]

const SVGStagingEl = document.getElementById('svg')

let images = [] // This is an associative array; TODO: something else
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

        // ctx.drawImage() can only draw things that are images (so you can't draw)
        // an SVG directly. <use> doesn't seem to work directly (maybe <use> inside an
        // image blob doesn't have access to the SVGs on the page?)
        // So we have to create an image using a reconstructed SVG as a data blob.
        // Here, let's cache all the artwork svgs as image elements for
        // later rendering to canvas
        let svgEls = SVGStagingEl.querySelectorAll('symbol')

        for (let svg of svgEls) {
          // Only cache segment illustrations, don't need to cache icons
          if (svg.id.indexOf('image-') === 0) {
            // Simplify id, removing namespace prefix
            const id = svg.id.replace(/^image-/, '')
            const svgInternals = svg.innerHTML
            const svgViewbox = svg.getAttribute('viewBox')

            // We need the namespacing and the original viewBox
            // The other SVG attributes don't seem necessary (tested on Chrome)
            // TODO: This only works on Chrome
            const svgHTML =
              `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${svgViewbox}'>
                ${svgInternals}
              </svg>`

            const svgBlob = new Blob([svgHTML], { type: 'image/svg+xml;charset=utf-8' })
            const img = new Image()

            img.src = window.URL.createObjectURL(svgBlob)
            img.height = svg.viewBox.baseVal.height
            img.width = svg.viewBox.baseVal.width

            // Store on the global images object
            images[id] = img
          }
        }

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
