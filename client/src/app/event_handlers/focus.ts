import store from '~/src/store'
import { updateSettings } from '~/src/store/slices/settings'
import { fetchStreetForVerification } from '~/src/streets/xhr'

export function onWindowFocus (): void {
  const state = store.getState()
  if (state.errors.abortEverything || state.gallery.visible) {
    return
  }

  fetchStreetForVerification()

  // Save settings on window focus, so the last edited street is the one you’re
  // currently looking at (in case you’re looking at many streets in various
  // tabs). We don't pass in any new settings to save, but calling this does
  // trigger mirroring the app state to localstorage and user account.
  store.dispatch(updateSettings({}))
}
