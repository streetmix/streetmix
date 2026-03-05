// In the past, dismissing the welcome panel would set this flag in
// LocalStorage, and the next time a welcome panel would be shown for a
// returning user, the presence of this flag would show different content (or
// not display the welcome panel at all).
//
// This naming convention caused confusion during the conversion to a
// React function component, because in reality there are two states we care
// about:
// - the welcome panel is dismissed _for the session_ (and will not re-apppear
//   _this session_)
// - the user is a first-time user, and dismissing the welcome panel changes
//   its content _in the future_
//
// The first value is ephemeral state, so it is set only for the duration of
// the session and is discarded if the tab is closed. We want to keep using
// `dismissed` to label this state.
//
// The second value is persistent state. This is the one that's saved to
// LocalStorage and is retrieved when the app is loaded to determine what
// type of welcome message will be displayed. The LocalStorage key name
// is now no longer what it means, but for now we keep it for backwards
// compatibility
//
// Exported value for test, do not import in runtime code.
export const LOCAL_STORAGE_RETURNING_USER = 'settings-welcome-dismissed'

/**
 * When the Welcome Panel is dismissed for the first time we mark this browser
 * as a "returning user" so that the message is not geared toward first-time
 * users the next time they visit the site.
 */
export function setIsReturningUser(): void {
  window.localStorage.setItem(LOCAL_STORAGE_RETURNING_USER, 'true')
}

/**
 * Retrieves LocalStorage state for whether user is a returning user
 */
export function getIsReturningUser(): boolean {
  const localSetting = window.localStorage.getItem(LOCAL_STORAGE_RETURNING_USER)

  if (localSetting !== null) {
    return JSON.parse(localSetting)
  }

  return false
}
