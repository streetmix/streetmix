import { SET_LOCALE } from '../actions'

const initialState = {
  locale: 'en',
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
