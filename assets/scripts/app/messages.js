import { supplant } from '../util/helpers'

// TODO: Localize
// These strings have been added to translation.json, but are still read from here
const messages = {
  UI_GLYPH_X: '×',

  PROMPT_DELETE_STREET: 'Are you sure you want to permanently delete {{name}}? This cannot be undone.',

  TOOLTIP_REMOVE_SEGMENT: 'Remove segment',
  TOOLTIP_SEGMENT_WIDTH: 'Change width of the segment',
  TOOLTIP_BUILDING_HEIGHT: 'Change the number of floors',
  TOOLTIP_INCREASE_WIDTH: 'Increase width (hold Shift for more precision)',
  TOOLTIP_DECREASE_WIDTH: 'Decrease width (hold Shift for more precision)',
  TOOLTIP_ADD_FLOOR: 'Add floor',
  TOOLTIP_REMOVE_FLOOR: 'Remove floor',

  WARNING_TOO_WIDE: 'This segment might be too wide.',
  WARNING_NOT_WIDE_ENOUGH: 'This segment might not be wide enough.',
  WARNING_DOESNT_FIT: 'This segment doesn’t fit within the street.',

  USER_ANONYMOUS: 'Anonymous',

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
