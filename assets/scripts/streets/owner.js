import { getRemixOnFirstEdit } from './remix'
import store from '../store'

/**
 * A helper function that tells us whether the current street is
 * "owned" by the current user. There are two kinds of ownership:
 *
 * (1) the street has a known creator ID, and the user is
 *     currently signed in with the same creator ID.
 * (2) the street has no creator ID (it is anonymous), and the
 *     user is not currently signed in, but is editing the street
 *     within the same session.
 *
 * The second one is the hard one because anonymous streets are
 * regarded as orphaned the moment user leaves the session. We
 * currently have no way of tracking anonymous streets across
 * multiple sessions (or even a single tab reload).
 *
 * TODO: Remove dependency on `getRemixOnFirstEdit()`, which is
 * a variable that's set when a page is loaded to track whether the
 * current anonymous street belongs to the current session.
 */
export function isOwnedByCurrentUser () {
  const state = store.getState()

  if (!state) return false

  const signedIn = state.user?.signedIn || false
  const creatorId = state.street?.creatorId || null
  const userId = state.user?.signInData?.userId || null

  if (signedIn && creatorId && creatorId === userId) {
    return true
  } else if (!creatorId && !signedIn && !getRemixOnFirstEdit()) {
    return true
  }

  return false
}
