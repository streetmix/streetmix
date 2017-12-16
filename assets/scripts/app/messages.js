import { supplant } from '../util/helpers'

// TODO: Localize
// These strings have been added to translation.json, but are still read from here
const messages = {
  TOOLTIP_BUILDING_HEIGHT: 'Change the number of floors',
  TOOLTIP_ADD_FLOOR: 'Add floor',
  TOOLTIP_REMOVE_FLOOR: 'Remove floor',

  DEFAULT_STREET_NAME: 'Unnamed St',

  SEGMENT_NAME_EMPTY: 'Empty space'
}

export function msg (messageId, data) {
  if (data) {
    return supplant(messages[messageId], data)
  } else {
    return messages[messageId]
  }
}
