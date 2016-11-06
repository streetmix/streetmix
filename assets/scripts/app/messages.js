// TODO: Localize
// These strings have been added to translation.json, but are still read from here
const messages = {
  UI_GLYPH_X: '×',

  PROMPT_NEW_STREET_NAME: 'New street name:',
  PROMPT_DELETE_STREET: 'Are you sure you want to permanently delete [[name]]? This cannot be undone.',
  PROMPT_NEW_STREET_WIDTH: 'New street width (from [[minWidth]] to [[maxWidth]]):',

  MENU_SWITCH_TO_IMPERIAL: 'Switch to imperial units (feet)',
  MENU_SWITCH_TO_METRIC: 'Switch to metric units',

  TOOLTIP_REMOVE_SEGMENT: 'Remove segment',
  TOOLTIP_DELETE_STREET: 'Delete street',
  TOOLTIP_SEGMENT_WIDTH: 'Change width of the segment',
  TOOLTIP_BUILDING_HEIGHT: 'Change the number of floors',
  TOOLTIP_INCREASE_WIDTH: 'Increase width (hold Shift for more precision)',
  TOOLTIP_DECREASE_WIDTH: 'Decrease width (hold Shift for more precision)',
  TOOLTIP_ADD_FLOOR: 'Add floor',
  TOOLTIP_REMOVE_FLOOR: 'Remove floor',

  STATUS_SEGMENT_DELETED: 'The segment has been removed.',
  STATUS_ALL_SEGMENTS_DELETED: 'All segments have been removed.',
  STATUS_NOTHING_TO_UNDO: 'Nothing to undo.',
  STATUS_NOTHING_TO_REDO: 'Nothing to redo.',
  STATUS_NO_NEED_TO_SAVE: 'No need to save by hand; Streetmix automatically saves your street!',
  STATUS_NOW_REMIXING: 'Now editing a freshly-made duplicate of the original street. The duplicate has been put in your gallery.',
  STATUS_NOW_REMIXING_SIGN_IN: 'Now editing a freshly-made duplicate of the original street. <a href="/[[signInUrl]]">Sign in</a> to start your own gallery of streets.',
  STATUS_RELOADED_FROM_SERVER: 'Your street was reloaded from the server as it was modified elsewhere.',

  WARNING_TOO_WIDE: 'This segment might be too wide.',
  WARNING_NOT_WIDE_ENOUGH: 'This segment might not be wide enough.',
  WARNING_DOESNT_FIT: 'This segment doesn’t fit within the street.',

  BLOCKING_REMIXING: 'Remixing…',
  LOADING: 'Loading…',

  USER_ANONYMOUS: 'Anonymous',

  STREET_COUNT_0: 'No streets yet',
  STREET_COUNT_1: '1 street',
  STREET_COUNT_MANY: '[[streetCount]] streets',

  DEFAULT_STREET_NAME: 'Canal Street (Existing)',

  SEGMENT_NAME_EMPTY: 'Empty space',

  DATE_MINUTES_AGO: 'A few minutes ago',
  DATE_SECONDS_AGO: 'A few seconds ago',
  DATE_YESTERDAY: 'Yesterday at [[time]]',
  DATE_TODAY: 'Today at [[time]]'
}

export function msg (messageId, data) {
  if (data) {
    return supplant(messages[messageId], data)
  } else {
    return messages[messageId]
  }
}

/**
 * Adapted from Crockford's "Remedial Javascript"
 * http://javascript.crockford.com/remedial.html
 * Crockford's implementation recommended extending the String prototype object,
 * but much has been said about not doing that, e.g.:
 * https://www.nczonline.net/blog/2010/03/02/maintainable-javascript-dont-modify-objects-you-down-own/
 * Since it is only used for this module's purpose, it is now merely a function
 * that returns a supplanted string, rather than extending the String prototype.
 */
function supplant (string, data) {
  return string.replace(/\[\[([^\[\]]*)\]\]/g,
    function (a, b) {
      var r = data[b]
      return typeof r === 'string' || typeof r === 'number' ? r : a
    }
  )
}
