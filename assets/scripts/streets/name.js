import { updatePageTitle } from '../app/page_title'
import { updatePageUrl } from '../app/page_url'
import { getStreet } from './data_model'
import { updateStreetMetadata } from './metadata'
import { unifyUndoStack } from './undo_stack'

// This is called everywhere.
// TODO: Create a specific init / create function?
// TODO: Updating the street name as a response to events?
export function updateStreetName () {
  let street = getStreet()
  updateStreetMetadata(street)
  unifyUndoStack()
  updatePageUrl()
  updatePageTitle()
}
