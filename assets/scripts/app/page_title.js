import { getSignInData, isSignedIn } from '../users/authentication'
import store from '../store'

/**
 * Updates page title.
 * This is called whenever the name of the street changes and it affects
 * the document title.
 */
export function updatePageTitle () {
  let title = ''
  const street = store.getState().street

  if (street.creatorId && (!isSignedIn() || (getSignInData().userId !== street.creatorId))) {
    title = getPageTitleWithAuthor()
  } else {
    title = getPageTitle()
  }

  document.title = title
}

/**
 * Gets page title without author name.
 * Displayed when a street has an anonymous creator, if the creator is the
 * current user, and for uses where displaying an author name is not needed,
 * e.g. Facebook sharing
 */
export function getPageTitle () {
  const street = store.getState().street
  return `${street.name} – Streetmix`
}

/**
 * Gets page title with author name.
 * Displayed when a street has an creator
 */
export function getPageTitleWithAuthor () {
  const street = store.getState().street
  return `${street.name} (by ${street.creatorId}) – Streetmix`
}
