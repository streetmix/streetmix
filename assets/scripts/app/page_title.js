/* global getSignInData, isSignedIn */
// these imports need to be restored after fixing registering key in module
// of scope menu/menu.js
// import { getSignInData, isSignedIn } from '../users/authentication'
import { getStreet } from '../streets/data_model'

/**
 * Updates page title.
 * This is called whenever the name of the street changes and it affects
 * the document title.
 */
export function updatePageTitle () {
  let title = ''
  let street = getStreet()

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
  let street = getStreet()
  return `${street.name} – Streetmix`
}

/**
 * Gets page title with author name.
 * Displayed when a street has an creator
 */
export function getPageTitleWithAuthor () {
  let street = getStreet()
  return `${street.name} (by ${street.creatorId}) – Streetmix`
}
