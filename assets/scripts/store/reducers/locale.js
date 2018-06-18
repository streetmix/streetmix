import { LOAD_LOCALE, SET_LOCALE } from '../actions'
import { DEFAULT_LOCALE } from '../../locales/constants'

const initialState = {
  // Default language will be the app's DEFAULT_LANGUAGE (not based on browser
  // -- this can cause unexpected behavior when the app is starting)
  locale: DEFAULT_LOCALE,
  isLoading: false,
  requestedLocale: null,
  messages: {},
  segmentInfo: {}
}

const locale = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_LOCALE:
      return {
        ...state,
        isLoading: true,
        requestedLocale: action.locale
      }
    case SET_LOCALE:
      return {
        ...state,
        locale: action.locale,
        isLoading: false,
        requestedLocale: null,
        messages: action.messages,
        segmentInfo: action.segmentInfo || state.segmentInfo
      }
    default:
      return state
  }
}

export default locale
