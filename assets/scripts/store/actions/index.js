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
export const START_PRINTING = 'START_PRINTING'
export const STOP_PRINTING = 'STOP_PRINTING'
export const EVERYTHING_LOADED = 'EVERYTHING_LOADED'

/* debug */
export const SET_DEBUG_FLAGS = 'SET_DEBUG_FLAGS'

/* dialogs */
export const SHOW_DIALOG = 'SHOW_DIALOG'
export const CLEAR_DIALOGS = 'CLEAR_DIALOGS'

/* flags */
export const SET_FEATURE_FLAG = 'SET_FEATURE_FLAG'
export const SET_FLAG_OVERRIDES = 'SET_FLAG_OVERRIDES'

/* gallery */
export const SHOW_GALLERY = 'SHOW_GALLERY'
export const HIDE_GALLERY = 'HIDE_GALLERY'
export const RECEIVE_GALLERY_STREETS = 'RECEIVE_GALLERY_STREETS'
export const DELETE_GALLERY_STREET = 'DELETE_GALLERY_STREET'
export const SET_GALLERY_STATE = 'SET_GALLERY_STATE'

/* info bubble */
export const SHOW_INFO_BUBBLE = 'SHOW_INFO_BUBBLE'
export const HIDE_INFO_BUBBLE = 'HIDE_INFO_BUBBLE'
export const UPDATE_HOVER_POLYGON = 'UPDATE_HOVER_POLYGON'
export const SET_INFO_BUBBLE_MOUSE_INSIDE = 'SET_INFO_BUBBLE_MOUSE_INSIDE'
export const SHOW_DESCRIPTION = 'SHOW_DESCRIPTION'
export const HIDE_DESCRIPTION = 'HIDE_DESCRIPTION'

/* locale */
export const LOAD_LOCALE = 'LOAD_LOCALE'
export const SET_LOCALE = 'SET_LOCALE'

/* map */
export const SET_MAP_STATE = 'SET_MAP_STATE'
export const RESET_MAP_STATE = 'RESET_MAP_STATE'

/* menus */
export const SHOW_MENU = 'SHOW_MENU'
export const CLEAR_MENUS = 'CLEAR_MENUS'

/* settings */
export const SET_USER_SETTINGS = 'SET_USER_SETTINGS'

/* persist settings -- settings saved in local storage */
export const SET_USER_UNITS = 'SET_USER_UNITS'

/* status */
export const SHOW_STATUS_MESSAGE = 'SHOW_STATUS_MESSAGE'
export const HIDE_STATUS_MESSAGE = 'HIDE_STATUS_MESSAGE'
export const SHOW_NO_CONNECTION_MESSAGE = 'SHOW_NO_CONNECTION_MESSAGE'

/* street */
export const REPLACE_STREET_DATA = 'REPLACE_STREET_DATA'

export const ADD_SEGMENT = 'ADD_SEGMENT'
export const REMOVE_SEGMENT = 'REMOVE_SEGMENT'
export const MOVE_SEGMENT = 'MOVE_SEGMENT'
export const CHANGE_SEGMENT_WIDTH = 'CHANGE_SEGMENT_WIDTH'
export const CHANGE_SEGMENT_VARIANT = 'CHANGE_SEGMENT_VARIANT'
export const CHANGE_SEGMENT_PROPERTIES = 'CHANGE_SEGMENT_PROPERTIES'
export const UPDATE_SEGMENTS = 'UPDATE_SEGMENTS'

export const ADD_LOCATION = 'ADD_LOCATION'
export const CLEAR_LOCATION = 'CLEAR_LOCATION'

export const SAVE_STREET_NAME = 'SAVE_STREET_NAME'
export const SAVE_CREATOR_ID = 'SAVE_CREATOR_ID'
export const SAVE_STREET_ID = 'SAVE_STREET_ID'
export const SET_UPDATE_TIME = 'SET_UPDATE_TIME'
export const SAVE_ORIGINAL_STREET_ID = 'SAVE_ORIGINAL_STREET_ID'
export const UPDATE_EDIT_COUNT = 'UPDATE_EDIT_COUNT'
export const SET_UNITS = 'SET_UNITS'
export const UPDATE_STREET_WIDTH = 'UPDATE_STREET_WIDTH'
export const UPDATE_SCHEMA_VERSION = 'UPDATE_SCHEMA_VERSION'

// BUILDINGS
export const ADD_BUILDING_FLOOR = 'ADD_BUILDING_FLOOR'
export const REMOVE_BUILDING_FLOOR = 'REMOVE_BUILDING_FLOOR'
export const SET_BUILDING_FLOOR_VALUE = 'SET_BUILDING_FLOOR_VALUE'
export const SET_BUILDING_VARIANT = 'SET_BUILDING_VARIANT'

// ENVIRONMENT
export const SET_ENVIRONMENT = 'SET_ENVIRONMENT'

/* system */
export const SET_SYSTEM_FLAGS = 'SET_SYSTEM_FLAGS'
export const UPDATE_WINDOW_SIZE = 'UPDATE_WINDOW_SIZE'

/* ui */
export const SHOW_STREET_NAME_CANVAS = 'SHOW_STREET_NAME_CANVAS'
export const HIDE_STREET_NAME_CANVAS = 'HIDE_STREET_NAME_CANVAS'
export const SET_ACTIVE_SEGMENT = 'SET_ACTIVE_SEGMENT'
export const INIT_DRAGGING_STATE = 'INIT_DRAGGING_STATE'
export const UPDATE_DRAGGING_STATE = 'UPDATE_DRAGGING_STATE'
export const CLEAR_DRAGGING_STATE = 'CLEAR_DRAGGING_STATE'
export const SET_DRAGGING_TYPE = 'SET_DRAGGING_TYPE'
export const TOGGLE_TOOLBOX = 'TOGGLE_TOOLBOX'

/* undo */
export const RESET_UNDO_STACK = 'RESET_UNDO_STACK'
export const REPLACE_UNDO_STACK = 'REPLACE_UNDO_STACK'
export const CREATE_NEW_UNDO = 'CREATE_NEW_UNDO'
export const UNDO = 'UNDO'
export const REDO = 'REDO'
export const UNIFY_UNDO_STACK = 'UNIFY_UNDO_STACK'

/* user */
export const SET_USER_SIGN_IN_DATA = 'SET_USER_SIGN_IN_DATA'
export const SET_USER_SIGNED_IN_STATE = 'SET_USER_SIGNED_IN_STATE'
export const SET_USER_SIGN_IN_LOADED_STATE = 'SET_USER_SIGN_IN_LOADED_STATE'
export const GEOLOCATION_DATA = 'GEOLOCATION_DATA'
export const GEOLOCATION_ATTEMPTED = 'GEOLOCATION_ATTEMPTED'
export const REMEMBER_USER_PROFILE = 'REMEMBER_USER_PROFILE'

/* errors */
export const SHOW_ERROR = 'SHOW_ERROR'
export const HIDE_ERROR = 'HIDE_ERROR'
