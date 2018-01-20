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
  '/images/tiles-3.png'
]

const SVGS_TO_BE_LOADED = [
  '/images/sky-front.svg',
  '/images/sky-rear.svg',
  '/assets/images/icons.svg',
  '/assets/images/images.svg'
]

const SVGStagingEl = document.getElementById('svg')

export const images = [] // This is an associative array; TODO: something else
let loading = []

export const svgCache = new Map()

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
      .then((response) => {
        return response.text()
      })
      .then((response) => {
        SVGStagingEl.innerHTML += response

        // ctx.drawImage() can only draw things that are images, so you can't draw
        // an SVG directly. You also can't <use> a symbol reference from inside an
        // image tag. So we have to create an image using a reconstructed SVG as a
        // data-URI. Here, let's cache all the artwork svgs as image elements,
        // and include the original svg + width/height information, to assist with
        // later rendering to canvas

        // Get all the <symbol>s
        let symbolEls = SVGStagingEl.querySelectorAll('symbol')

        for (let svg of symbolEls) {
          // Skip icons, we don't need to cache these
          if (svg.id.indexOf('icon-') === 0) continue

          // Simplify id, removing namespace prefix
          const id = svg.id.replace(/^image-/, '')

          // Get a string representation of symbol so we can reconstruct an image element
          const svgHTML = convertSVGSymbolToSVGHTML(svg)

          cacheSVGObject(id, svg, svgHTML)
        }

        // Captures anything with its own viewbox, whether that's an svg file
        // or symbol elements within a svg.
        let svgEls = SVGStagingEl.querySelectorAll('svg[viewBox]')

        for (let svg of svgEls) {
          // Right now none of these have ids, use the url
          const id = url

          // Get a string representation of symbol so we can reconstruct an image element
          const svgHTML = getSVGOuterHTML(svg)

          cacheSVGObject(id, svg, svgHTML)
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

/**
 * Gets a string representation of an <svg> via its outerHTML property
 * or with a fallback method if outerHTML is unavailable (IE / Edge)
 *
 * @param {SVGElement} svg
 * @return {string}
 */
function getSVGOuterHTML (svg) {
  let outerHTML = svg.outerHTML

  // If `outerHTML` is not available, use this alternate method below
  if (typeof outerHTML === 'undefined') {
    outerHTML = new XMLSerializer().serializeToString(svg)
  }

  return outerHTML
}

/**
 * Gets a string representation of an svg <symbol>'s contents via
 * the innerHTML property or with a fallback method if innerHTML is
 * unavailable (IE / Edge)
 *
 * @param {SVGSymbolElement}
 * @return {string}
 */
function getSVGSymbolInnerHTML (symbol) {
  let innerHTML = symbol.innerHTML

  // If `innerHTML` is not available, use this alternate method below,
  // which iterates through each of the symbol's child nodes and
  // serializes each element to a string.
  if (typeof innerHTML === 'undefined') {
    innerHTML = ''
    Array.prototype.slice.call(symbol.childNodes).forEach(function (node, index) {
      innerHTML += (new window.XMLSerializer()).serializeToString(node)
    })
  }

  return innerHTML
}

/**
 * Given a <symbol> element wrap it in an <svg> so that it can be rendered
 * as an individual image
 *
 * @param {SVGSymbolElement} symbol
 * @return {string}
 */
function convertSVGSymbolToSVGHTML (symbol) {
  // Get a string representation of <symbol>
  const symbolHTML = getSVGSymbolInnerHTML(symbol)

  // Create a new svg from the <symbol>
  // SVG element requires the 'xmlns' namespace, as well as the original viewBox attribute
  // The width and height values are required in Firefox
  // and to display them at the correct size in IE / Edge
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${symbol.viewBox}" width="${symbol.viewBox.baseVal.width}" height="${symbol.viewBox.baseVal.height}">${symbolHTML}</svg>`
}

/**
 * Caches the processed SVG object to the SVGCache
 *
 * @param {string} id - key to identify the svg
 * @param {SVGElement|SVGSymbolElement} svg - original DOM nodes
 * @param {string} svgHTML - string representation of SVG
 */
function cacheSVGObject (id, svg, svgHTML) {
  // Browsers appear to do better with base-64 URLs rather than Blobs
  // (Chrome works with blobs, but setting width and height on SVG
  // makes rendering intermittent)
  const src = 'data:image/svg+xml;base64,' + window.btoa(svgHTML)

  const img = new window.Image()
  img.src = src

  // Store properties on svg cache, using its simplified id as the key
  svgCache.set(id, {
    el: svg,
    src: src,
    img: img,
    width: svg.viewBox.baseVal.width,
    height: svg.viewBox.baseVal.height
  })
}

export function hideLoadingScreen () {
  // NOTE:
  // This function might be called on very old browsers. Please make
  // sure not to use modern faculties.

  document.getElementById('loading').className += ' hidden'
}
