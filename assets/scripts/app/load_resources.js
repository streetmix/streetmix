/**
 * load_resources
 *
 * Loads images, etc and tracks progress. (WIP)
 * TODO: Rely on Promises to resolve progress
 */

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

export const images = [] // This is an associative array; TODO: something else
let loading = []

// Set loading bar
const loadingEl = document.getElementById('loading-progress')
loadingEl.max += 5 // Legacy; this is for other things that must load

// Load everything
loadImages()
loadSVGs()

// When everything is loaded...
export function checkIfImagesLoaded () {
  return Promise.all(loading)
}

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
        console.error('loading image error', error.message)
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

        // ctx.drawImage() can only draw things that are images, so you can't draw
        // an SVG directly. You also can't <use> a symbol reference from inside an
        // image tag. So we have to create an image using a reconstructed SVG as a
        // data-URI. Here, let's cache all the artwork svgs as image elements for
        // later rendering to canvas
        let svgEls = SVGStagingEl.querySelectorAll('symbol')

        for (let svg of svgEls) {
          // Only cache segment illustrations, don't need to cache icons
          if (svg.id.indexOf('image-') === 0) {
            // Simplify id, removing namespace prefix
            const id = svg.id.replace(/^image-/, '')

            // Get details of the SVG so we can reconstruct an image element
            const svgViewbox = svg.getAttribute('viewBox')
            let svgInternals = svg.innerHTML

            // innerHTML is not an available property for SVG elements in IE / Edge
            // so if turns to be undefined, we use this alternate method below,
            // which iterates through each of the symbol's child nodes and
            // serializes each element to a string.
            if (typeof svgInternals === 'undefined') {
              svgInternals = ''
              Array.prototype.slice.call(svg.childNodes).forEach(function (node, index) {
                svgInternals += (new window.XMLSerializer()).serializeToString(node)
              })
            }

            // SVG element requires the 'xmlns' namespace
            // As well as the original viewBox attribute
            // The width and height values are required in Firefox
            // and to display them at the correct size in IE / Edge
            const svgWidth = svg.viewBox.baseVal.width
            const svgHeight = svg.viewBox.baseVal.height
            const svgHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svgViewbox}" width="${svgWidth}" height="${svgHeight}">${svgInternals}</svg>`

            const img = new window.Image()
            // Browsers appear to do better with base-64 URLs rather than Blobs
            // (Chrome works with blobs, but setting width and height on SVG
            // makes rendering intermittent)
            img.src = 'data:image/svg+xml;base64,' + window.btoa(svgHTML)

            // Store on the global images object, using its simplified id as the key
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
    var img = new window.Image()
    img.onload = function () {
      resolve(img)
    }
    img.onerror = function () {
      reject(new Error('unable to load image ' + url))
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
