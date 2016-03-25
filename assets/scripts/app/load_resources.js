/**
 * load_resources
 *
 * Loads images, etc and tracks progress. (WIP)
 * TODO: Rely on Promises to resolve progress
 */
const SVGStagingEl = document.getElementById('svg')

export let iconsSVG = window.fetch('/assets/images/icons.svg')
  .then(function (response) {
    SVGStagingEl.innerHTML = response.text()
    return response
  })
  .catch(function (error) {
    console.log('doh', error)
  })
