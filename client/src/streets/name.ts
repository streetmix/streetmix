import { updatePageTitle } from '../app/page_title.js'
import { updatePageUrl } from '../app/page_url.js'
import { observeStore, type RootState } from '../store'

/**
 * Initializes a subscriber to changes in the street name,
 * and updates various parts of the UI in response.
 */
export function initStreetNameChangeListener() {
  // We create a string representation of the two values we need to compare
  const select = (state: RootState) =>
    JSON.stringify({
      name: state.street.name,
      creatorId: state.street.creatorId,
      namespacedId: state.street.namespacedId,
    })

  const onChange = (string: string) => {
    const street = JSON.parse(string)

    updatePageUrl()
    updatePageTitle(street)
  }

  return observeStore(select, onChange)
}
