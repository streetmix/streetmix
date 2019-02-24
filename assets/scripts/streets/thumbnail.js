import { trimStreetData } from './data_model'
import { getStreetImage } from './image'
import { getAuthHeader } from '../users/authentication'
import store from '../store'

let _lastSavedThumbnail

// Saves street thumbnail every five minutes (300000 ms) if any changes.
export function initSaveStreetThumbnailTimer () {
  const timer = window.setInterval(function () {
    const street = store.getState().street
    const currData = trimStreetData(street)

    if (JSON.stringify(currData) !== JSON.stringify(_lastSavedThumbnail)) {
      console.log('Updating street thumbnail.')
      saveStreetThumbnail(street)
    }
  }, 300000)

  return timer
}

// Creates street thumbnail and uploads thumbnail to cloudinary.
async function saveStreetThumbnail (street) {
  const thumbnail = getStreetImage(street, false, false, true, 2.0)
  const data = {
    image: thumbnail.toDataURL()
  }

  const options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json'
    }
  }

  try {
    const response = await window.fetch(`/services/images/streets/${street.id}`, options)
    if (response.ok) {
      _lastSavedThumbnail = trimStreetData(street)
    }
  } catch (err) {
    console.log(err)
  }
}
