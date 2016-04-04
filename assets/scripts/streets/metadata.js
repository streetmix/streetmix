/**
 * streets/metadata.js
 *
 * Updates the street's width, remaining or excess width,
 * author, and last updated date. This information appears
 * below the street name.
 *
 * @exports updateStreetMetadata
 */
import { formatDate } from '../util/date_format'
import { prettifyWidth } from '../util/width_units'
import { fetchAvatars } from '../users/avatars'
import { showGallery } from '../gallery/view'
import { msg } from '../app/messages'

/**
 * Updates all street metadata at once.
 * @param {Object} street - Street information.
 */
export function updateStreetMetadata (street) {
  displayStreetWidth(street.width)
  displayStreetWidthRemaining(street.remainingWidth)
  displayStreetAuthor(street.creatorId)
  displayLastUpdated(street.updatedAt)
}

/**
 * Updates street width display.
 * @param {number} width - Width of the current street.
 * @todo [i18n] text display
 */
function displayStreetWidth (width) {
  var el = document.getElementById('street-width-read-width')
  var contents = prettifyWidth(width, { markup: true }) + ' width'

  // Uses innerHTML because prettifyWidth() is asked to return markup (<wbr>s) in the string
  el.innerHTML = contents
}

/**
 * Updates the display of width over or under the available street width.
 * @param {number} remaingWidth - Width difference from actual street width.
 * @todo [i18n] text display
 */
function displayStreetWidthRemaining (remainingWidth) {
  var el = document.getElementById('street-width-read-difference')
  var width = prettifyWidth(Math.abs(remainingWidth), { markup: true })

  // Uses innerHTML because prettifyWidth() is asked to return markup (<wbr>s) in the string
  if (remainingWidth > 0) {
    el.className = 'street-width-under'
    el.innerHTML = '(' + width + ' room)'
  } else if (remainingWidth < 0) {
    el.className = 'street-width-over'
    el.innerHTML = '(' + width + ' over)'
  } else {
    // If remainingWidth is 0, this element's contents is empty.
    el.className = ''
    el.innerHTML = ''
  }
}

/**
 * Displays the street's creator
 * @param {?} creatorId
 * @todo [refactor]
 */
function displayStreetAuthor (creatorId) {
  /* global signedIn, signInData, app, remixOnFirstEdit */
  var el = document.querySelector('#street-metadata-author')

  if (creatorId && (!signedIn || (creatorId !== signInData.userId))) {
    // TODO const
    var html = "by <div class='avatar' userId='" + creatorId + "'></div>" +
      "<a class='user-gallery' href='/" +
      creatorId + "'>" + creatorId + '</a>'

    el.innerHTML = html

    fetchAvatars()

    if (!app.readOnly) {
      el.querySelector('.user-gallery').addEventListener('pointerdown', onAnotherUserIdClick)
    }
  } else if (!creatorId && (signedIn || remixOnFirstEdit)) {
    el.innerHTML = 'by ' + msg('USER_ANONYMOUS')
  } else {
    el.innerHTML = ''
  }
}

/**
 * Displays the street's last updated date
 * @param {string} updatedAt
 */
function displayLastUpdated (updatedAt) {
  var el = document.querySelector('#street-metadata-date')
  var date = formatDate(updatedAt)

  el.textContent = date
}

/**
 * @todo [jsdoc]
 */
function onAnotherUserIdClick (event) {
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    return
  }

  var el = event.target
  var userId = el.innerHTML

  showGallery(userId, false)

  event.preventDefault()
}
