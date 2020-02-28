import { updateEverything } from '../streets/data_model'
import { getFetchStreetUrl, unpackServerStreetData } from '../streets/xhr'
import store from '../store'

const LIVE_UPDATE_DELAY = 5000

export function scheduleNextLiveUpdateCheck () {
  window.setTimeout(checkForLiveUpdate, LIVE_UPDATE_DELAY)
}

function checkForLiveUpdate () {
  const url = getFetchStreetUrl()

  window.fetch(url, { method: 'HEAD' }).then(receiveLiveUpdateCheck)
}

function receiveLiveUpdateCheck (response) {
  const newUpdatedDate = Math.floor(
    new Date(response.headers.get('last-modified')).getTime() / 1000
  )
  const oldUpdatedDate = Math.floor(
    new Date(store.getState().street.updated_at).getTime() / 1000
  )

  if (newUpdatedDate !== oldUpdatedDate) {
    const url = getFetchStreetUrl()

    window
      .fetch(url)
      .then((response) => response.json())
      .then(receiveLiveUpdateStreet)
  }

  scheduleNextLiveUpdateCheck()
}

function receiveLiveUpdateStreet (transmission) {
  window.setTimeout(function () {
    unpackServerStreetData(transmission, null, null, false)
    updateEverything(true, false) // When receiving a street, don't save again
  }, 1000)

  window.dispatchEvent(new window.CustomEvent('stmx:live_update'))
}
