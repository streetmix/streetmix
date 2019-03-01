import { API_URL } from '../app/config'
import { trimStreetData } from './data_model'
import { getAuthHeader } from '../users/authentication'
import { drawStreetThumbnail } from '../gallery/thumbnail'
import { BUILDING_SPACE, getBuildingImageHeight } from '../segments/buildings'
import { TILE_SIZE } from '../segments/constants'
import { observeStore } from '../store'

// This can be adjusted to create much more hi-definition images
const SAVE_AS_IMAGE_DPI = 2.0

const SAVE_AS_IMAGE_MIN_HEIGHT = 400
const SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME = SAVE_AS_IMAGE_MIN_HEIGHT + 150
const SAVE_AS_IMAGE_BOTTOM_PADDING = 60

// Used in thumbnail
// TODO: a way to remove the circular dependency?!
export const SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING = 65

export function getStreetImage (street, transparentSky, segmentNamesAndWidths, streetName, dpi = SAVE_AS_IMAGE_DPI) {
  const width = (TILE_SIZE * street.width) + (BUILDING_SPACE * 2)

  const leftHeight = getBuildingImageHeight(street.leftBuildingVariant, 'left', street.leftBuildingHeight)
  const rightHeight = getBuildingImageHeight(street.rightBuildingVariant, 'right', street.rightBuildingHeight)

  let height = Math.max(leftHeight, rightHeight)

  if (height < SAVE_AS_IMAGE_MIN_HEIGHT) {
    height = SAVE_AS_IMAGE_MIN_HEIGHT
  }

  if (streetName && (height < SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME)) {
    height = SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME
  }

  height += SAVE_AS_IMAGE_BOTTOM_PADDING

  if (segmentNamesAndWidths) {
    height += SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING
  }

  const el = document.createElement('canvas')
  el.width = width * dpi
  el.height = height * dpi

  const ctx = el.getContext('2d')

  drawStreetThumbnail(ctx, street, width, height, dpi, 1.0, false, true, transparentSky, segmentNamesAndWidths, streetName)

  return el
}

// Save thumbnail if necessary every 5 minutes (300000 ms)
const SAVE_THUMBNAIL_TIME_INTERVAL = 300000
let _lastSavedTimestamp
let _unsavedThumbnail = true

export function isThumbnailUnsaved () {
  return _unsavedThumbnail
}

export function initStreetThumbnailSubscriber () {
  const select = (state) => {
    const currData = trimStreetData(state.street)
    return JSON.stringify(currData)
  }

  const onChange = (street) => {
    const timestamp = Date.now()
    const timeElapsed = timestamp - _lastSavedTimestamp

    if (!_lastSavedTimestamp || timeElapsed >= SAVE_THUMBNAIL_TIME_INTERVAL) {
      saveStreetThumbnail(JSON.parse(street))
    } else {
      _unsavedThumbnail = true
    }
  }

  return observeStore(select, onChange)
}

// Creates street thumbnail and uploads thumbnail to cloudinary.
export async function saveStreetThumbnail (street) {
  if (!_unsavedThumbnail) return

  const thumbnail = getStreetImage(street, false, false, true, 2.0)

  try {
    // .toDataURL is not available on IE11 when SVGs are part of the canvas.
    const dataUrl = thumbnail.toDataURL('image/png')
    const url = API_URL + 'v1/streets/images/' + street.id

    const options = {
      method: 'POST',
      body: dataUrl,
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'text/plain'
      }
    }

    const response = await window.fetch(url, options)

    if (response.ok) {
      console.log('Updated street thumbnail.')
      _lastSavedTimestamp = Date.now()
      _unsavedThumbnail = false
    }
  } catch (err) {
    console.log('Unable to save street thumbnail', err)
  }
}
