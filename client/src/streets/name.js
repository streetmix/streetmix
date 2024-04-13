import { updatePageTitle } from '../app/page_title'
import { updatePageUrl } from '../app/page_url'
import { observeStore } from '../store'
import { unifyUndoStack } from './undo_stack'

/**
 * Initializes a subscriber to changes in the street name,
 * and updates various parts of the UI in response.
 */
export function initStreetNameChangeListener () {
  // We create a string representation of the two values we need to compare
  const select = (state) =>
    JSON.stringify({
      name: state.street.name,
      creatorId: state.street.creatorId,
      namespacedId: state.street.namespacedId
    })

  const onChange = (string) => {
    const street = JSON.parse(string)

    unifyUndoStack()
    updatePageUrl()
    updatePageTitle(street)
  }

  return observeStore(select, onChange)
}
