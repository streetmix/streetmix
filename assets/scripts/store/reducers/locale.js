import { SET_LOCALE } from '../actions'
import { DEFAULT_LOCALE } from '../../locales/constants'

const initialState = {
  // Default language will be the app's DEFAULT_LANGUAGE (not based on browser
  // -- this can cause unexpected behavior when the app is starting)
  locale: DEFAULT_LOCALE,
  messages: {},
  segmentInfo: {}
}

const locale = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOCALE:
      return {
        ...state,
        locale: action.locale,
        messages: action.messages,
        segmentInfo: action.segmentInfo || state.segmentInfo
      }
    default:
      return state
  }
}

export default locale
