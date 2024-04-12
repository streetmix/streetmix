export const images = new Map()

const loadImages = (id) => {
  const width = 96
  const height = 96
  const viewBox = '0 0 96 96'
  const symbolHTML =
    '<symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" id="image-markings--straight-inbound"><path d="M53.538 53.253V19.865H42.862v33.388H31.7l16.5 23.682 16.5-23.682H53.538z" fill="#fff" fill-rule="nonzero"/></symbol></svg>'
  const svgHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">${symbolHTML}</svg>`
  const src = 'data:image/svg+xml;base64,' + window.btoa(svgHTML)

  const img = new window.Image()
  img.src = src
  images.set(id, {
    img,
    width,
    height
  })
}

loadImages('markings--straight-inbound')
