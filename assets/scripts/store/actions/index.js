/**
 * Redux store actions.
 *
 * A "best practice" for large applications is to store actions as string
 * constants. The following text is copied from Redux documentation:
 * http://redux.js.org/docs/recipes/ReducingBoilerplate.html#actions
 *
 *  > Why is this beneficial? It is often claimed that constants are unnecessary,
 *  > and for small projects, this might be correct. For larger projects, there
 *  > are some benefits to defining action types as constants:
 *
 *  >   - It helps keep the naming consistent because all action types are
 *  >     gathered in a single place.
 *  >   - Sometimes you want to see all existing actions before working on a
 *  >     new feature. It may be that the action you need was already added by
 *  >     somebody on the team, but you didn't know.
 *  >   - The list of action types that were added, removed, and changed in a
 *  >     Pull Request helps everyone on the team keep track of scope and
 *  >     implementation of new features.
 *  >   - If you make a typo when importing an action constant, you will get
 *  >     `undefined`. Redux will immediately throw when dispatching such an
 *  >     action, and you'll find the mistake sooner.
 *
 * Following that suggestion, we will collect and export all actions as string
 * constants from this module.
 *
 * We are not currently exporting action creators (see that documentation to
 * learn more about them). This may change in the future as the need arises,
 * but for now all scripts can dispatch to the store directly.
 *
 * > Action creators have often been criticized as boilerplate. Well, you don't
 * > have to write them!
 */

/* app */
export const SET_APP_FLAGS = 'SET_APP_FLAGS'
export const SET_PRINTING = 'SET_PRINTING'

/* debug */
export const SET_DEBUG_FLAGS = 'SET_DEBUG_FLAGS'

/* dialogs */
export const SHOW_DIALOG = 'SHOW_DIALOG'
export const CLEAR_DIALOGS = 'CLEAR_DIALOGS'

/* menus */
export const SHOW_MENU = 'SHOW_MENU'
export const CLEAR_MENUS = 'CLEAR_MENUS'

/* settings */
export const SET_USER_SETTINGS = 'SET_USER_SETTINGS'

/* status */
export const SHOW_STATUS_MESSAGE = 'SHOW_STATUS_MESSAGE'
export const HIDE_STATUS_MESSAGE = 'HIDE_STATUS_MESSAGE'
export const SHOW_NO_CONNECTION_MESSAGE = 'SHOW_NO_CONNECTION_MESSAGE'

/* system */
export const SET_SYSTEM_FLAGS = 'SET_SYSTEM_FLAGS'

/* user */
export const SET_USER_SIGN_IN_DATA = 'SET_USER_SIGN_IN_DATA'
export const SET_USER_SIGNED_IN_STATE = 'SET_USER_SIGNED_IN_STATE'
export const SET_USER_SIGN_IN_LOADED_STATE = 'SET_USER_SIGN_IN_LOADED_STATE'
