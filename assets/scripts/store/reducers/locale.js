import { SET_LOCALE, SET_SEGMENT_TRANSLATIONS } from '../actions'

const initialState = {
  // Default language is set by browser, or is English if undetermined
  // Substitute 'en' for 'en-US' locales
  // TODO: make that unnecessary
  locale: navigator.language.replace('en-US', 'en') || 'en',
  messages: {},
  segmentInfo: {}
}

const locale = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOCALE:
      return {
        ...state,
        locale: action.locale,
        messages: action.messages
      }
    case SET_SEGMENT_TRANSLATIONS:
      return {
        ...state,
        segmentInfo: action.messages
      }
    default:
      return state
  }
}

export default locale
