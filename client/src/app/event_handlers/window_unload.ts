import store from '~/src/store'
import { getSaveStreetIncomplete } from '~/src/streets/xhr'
import {
  isThumbnailSaved,
  SAVE_THUMBNAIL_EVENTS,
  saveStreetThumbnail
} from '~/src/streets/image'

function checkIfChangesSaved (): boolean {
  if (store.getState().errors.abortEverything) {
    return false
  }

  let showWarning = false

  if (getSaveStreetIncomplete()) {
    showWarning = true
  }

  // If thumbnail needs to be saved before window close, show warning.
  if (!isThumbnailSaved()) {
    showWarning = true
  }

  if (showWarning) {
    saveStreetThumbnail(
      store.getState().street,
      SAVE_THUMBNAIL_EVENTS.BEFOREUNLOAD
    )

    return true
  }

  return false
}

export function onWindowBeforeUnload (
  event: BeforeUnloadEvent
): string | undefined {
  const shouldPrompt = checkIfChangesSaved()

  if (shouldPrompt) {
    // HTML specification for prompting users if they want to leave
    // Not supported in all browsers
    event.preventDefault()

    // Custom text prompts are no longer displayed in most browsers. See:
    // https://developers.google.com/web/updates/2016/04/chrome-51-deprecations?hl=en#remove_custom_messages_in_onbeforeunload_dialogs
    // `event.returnValue` just needs to be set to _any_ string or a string
    // is returned from this handler. The browser-defined prompt will display.
    // No translation is needed.
    const string = 'Your changes have not been saved yet.'
    event.returnValue = string
    return string
  }
}
