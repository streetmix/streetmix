import { getGalleryForUser, getGalleryForAllStreets } from '../util/api'
import { MODES, processMode, setMode } from '../app/mode'
import { receiveGalleryData } from './view'

export async function fetchGalleryData (userId) {
  try {
    if (userId) {
      const response = await getGalleryForUser(userId)
      const streets = receiveGalleryData(response.data)

      return streets
    } else {
      const response = await getGalleryForAllStreets()
      const streets = receiveGalleryData(response.data)

      return streets
    }
  } catch (error) {
    // If the error is a 404, throw up a not-found page
    if (error.response.status === 404) {
      setMode(MODES.NOT_FOUND)
      processMode()
    }

    // Re-throw the original error. This is caught by Redux Toolkit's
    // `asyncThunkCreator` and dispatches a rejected action
    throw error
  }
}
