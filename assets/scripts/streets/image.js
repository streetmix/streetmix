import { trimStreetData } from './data_model'
import { getAuthHeader } from '../users/authentication'
import { drawStreetThumbnail } from '../gallery/thumbnail'
import { BUILDING_SPACE, getBuildingImageHeight } from '../segments/buildings'
import { TILE_SIZE } from '../segments/constants'
import store from '../store'

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

let _lastSavedThumbnail

// Saves street thumbnail every five minutes (300000 ms) if any changes.
export function initSaveStreetThumbnailTimer () {
  const timer = window.setInterval(function () {
    if (checkSaveThumbnailIncomplete()) {
      console.log('Updating street thumbnail.')
      saveStreetThumbnail(store.getState().street)
    }
  }, 300000)

  return timer
}

// Creates street thumbnail and uploads thumbnail to cloudinary.
export async function saveStreetThumbnail (street) {
  const thumbnail = getStreetImage(street, false, false, true, 2.0)

  try {
    // .toDataURL is not available on IE11 when SVGs are part of the canvas.
    const dataUrl = thumbnail.toDataURL('image/png')
    const data = {
      image: dataUrl
    }

    const options = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      }
    }

    const response = await window.fetch(`/services/images/streets/${street.id}`, options)
    if (response.ok) {
      console.log('Updated street thumbnail.')
      _lastSavedThumbnail = trimStreetData(street)
    }
  } catch (err) {
    console.log('Unable to save street thumbnail', err)
  }
}

export function checkSaveThumbnailIncomplete () {
  const street = store.getState().street
  const currData = trimStreetData(street)

  return (JSON.stringify(currData) !== JSON.stringify(_lastSavedThumbnail))
}
