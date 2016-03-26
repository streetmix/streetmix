/**
 * load_resources
 *
 * Loads images, etc and tracks progress. (WIP)
 * TODO: Rely on Promises to resolve progress
 */
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
