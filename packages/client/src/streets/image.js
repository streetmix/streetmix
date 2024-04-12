import { getBuildingImageHeight } from '../segments/buildings'
import { TILE_SIZE, BUILDING_SPACE } from '../segments/constants'
import { deleteStreetImage } from '../util/api'
import store, { observeStore } from '../store'
import { drawStreetThumbnail } from './thumbnail'
import { trimStreetData } from './data_model'

// This can be adjusted to create much more hi-definition images
const SAVE_AS_IMAGE_DPI = 2.0

const SAVE_AS_IMAGE_MIN_HEIGHT = 400
const SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME = SAVE_AS_IMAGE_MIN_HEIGHT + 150
const SAVE_AS_IMAGE_BOTTOM_PADDING = 60

// Used in thumbnail
// TODO: a way to remove the circular dependency?!
export const SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING = 65

export function getStreetImage (
  street,
  transparentSky,
  segmentNamesAndWidths,
  streetName,
  dpi = SAVE_AS_IMAGE_DPI,
  watermark = true
) {
  const width = TILE_SIZE * street.width + BUILDING_SPACE * 2

  const leftHeight = getBuildingImageHeight(
    street.leftBuildingVariant,
    'left',
    street.leftBuildingHeight
  )
  const rightHeight = getBuildingImageHeight(
    street.rightBuildingVariant,
    'right',
    street.rightBuildingHeight
  )

  let height = Math.max(leftHeight, rightHeight)

  if (height < SAVE_AS_IMAGE_MIN_HEIGHT) {
    height = SAVE_AS_IMAGE_MIN_HEIGHT
  }

  if (streetName && height < SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME) {
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

  drawStreetThumbnail(ctx, street, {
    width,
    height,
    dpi,
    multiplier: 1.0,
    silhouette: false,
    bottomAligned: true,
    transparentSky,
    segmentNamesAndWidths,
    streetName,
    watermark
  })

  return el
}

// Save thumbnail if necessary every 30 minutes (1800000 ms)
const SAVE_THUMBNAIL_TIME_INTERVAL = 1800000
let _lastSavedTimestamp

// Temporarily disabled. Commented out to prevent eslint errors.
// let _savedThumbnail

export const SAVE_THUMBNAIL_EVENTS = {
  INITIAL: 'INITIAL',
  SHARE: 'SHARE',
  TIMER: 'TIMER',
  BEFOREUNLOAD: 'BEFOREUNLOAD',
  PREVIOUS_STREET: 'PREVIOUS_STREET'
}

export function isThumbnailSaved () {
  // return _savedThumbnail
  return true
}

export function initStreetThumbnailSubscriber () {
  // Save street thumbnail on initial street render.
  saveStreetThumbnail(
    trimStreetData(store.getState().street),
    SAVE_THUMBNAIL_EVENTS.INITIAL
  )

  const select = (state) => {
    const street = { editCount: state.street.editCount, id: state.street.id }
    return JSON.stringify(street)
  }

  const onChange = () => {
    const timestamp = Date.now()
    const timeElapsed = timestamp - _lastSavedTimestamp
    // _savedThumbnail = false

    // Save street thumbnail every 30 minutes if any changes to street.
    if (timeElapsed && timeElapsed >= SAVE_THUMBNAIL_TIME_INTERVAL) {
      const street = trimStreetData(store.getState().street)
      saveStreetThumbnail(street, SAVE_THUMBNAIL_EVENTS.TIMER)
    }
  }

  return observeStore(select, onChange)
}

// Creates street thumbnail and uploads thumbnail to cloudinary.
// TEMPORARILY DISABLED.
export async function saveStreetThumbnail (street, event) {
  // if (_savedThumbnail) return
  // _lastSavedTimestamp = Date.now()
  // const thumbnail = getStreetImage(street, false, false, true, 2.0, false)
  // try {
  //   // .toDataURL is not available on IE11 when SVGs are part of the canvas.
  //   const dataUrl = thumbnail.toDataURL('image/png')
  //   const details = {
  //     image: dataUrl,
  //     event,
  //     editCount: street.editCount,
  //     creatorId: street.creatorId
  //   }
  //   // Check if street is default or empty street.
  //   // If a signed-in user adopts an existing street, the editCount is set to 0 even if it isn't a DEFAULT or EMPTY street.
  //   // Only if the street has an editCount = 0 and has no originalStreetId, should we set the streetType.
  //   if (street.editCount === 0 && !street.originalStreetId) {
  //     const streetType = (street.segments.length) ? 'DEFAULT_STREET' : 'EMPTY_STREET'
  //     details.streetType = streetType
  //   }
  //   const url = '/api/v1/streets/' + street.id + '/images'
  //   const options = {
  //     method: 'POST',
  //     body: JSON.stringify(details),
  //     headers: {
  //       'Content-Type': 'text/plain'
  //     }
  //   }
  //   const response = await window.fetch(url, options)
  //   if (response.ok) {
  //     console.log('Updated street thumbnail.')
  //     _savedThumbnail = true
  //   } else {
  //     const results = await response.json()
  //     // For now, we are only saving street thumbnails once (when the street first renders)
  //     // Any other situation (i.e. timer, share menu) returns an error that does not need to be logged.
  //     if (results.status !== 501) {
  //       throw new Error(results.msg)
  //     }
  //   }
  // } catch (err) {
  //   console.log('Unable to save street thumbnail. ', err)
  // }
}

// Handles removing street thumbnail from cloudinary.
export async function deleteStreetThumbnail (streetId) {
  try {
    // As this function returns a Promise, awaiting it allows rejected
    // Promises to be caught by the `catch` block below.
    await deleteStreetImage(streetId)
  } catch (error) {
    console.error('Unable to delete street thumbnail.', error)
  }
}
