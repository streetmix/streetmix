import { SET_LOCALE } from '../actions'

const initialState = {
  // Default language is set by browser, or is English if undetermined
  locale: navigator.language || 'en',
  messages: {}
}

const locale = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOCALE:
      return {
        ...state,
        locale: action.locale,
        messages: action.messages
      }
    default:
      return state
  }
}

export default locale
