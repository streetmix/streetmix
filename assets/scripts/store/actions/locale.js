import { SET_LOCALE } from './index'

export function setLocale (locale, messages) {
  return {
    type: SET_LOCALE,
    locale,
    messages
  }
}
