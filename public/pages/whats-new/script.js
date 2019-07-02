/**
 * Adds a very light shadow to indicate depth when the frame
 * content has scrolled. This script is not included inline
 * because it conflicts with the server's Content Security Policy.
 */
var el = document.createElement('div')
el.className = 'scroll-shade'
document.body.appendChild(el)
if (document.documentElement) {
  // Handle if frame loads/reloaded at a scroll position
  if (document.documentElement.scrollTop > 30) {
    el.classList.add('visible')
  }

  // Add scroll listener
  document.addEventListener('scroll', function (event) {
    if (document.documentElement.scrollTop > 30) {
      el.classList.add('visible')
    } else {
      el.classList.remove('visible')
    }
  })
}
