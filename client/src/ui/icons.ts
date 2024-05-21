/**
 * Imports FontAwesome icons
 */
// "deep import" style to workaround a "Maximum call stack exceeded" issue
// that only happens with the `free-solid-svg-icons` package.
// for instance: https://github.com/FortAwesome/react-native-fontawesome/issues/123
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft'
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons/faArrowRotateLeft'
import { faArrowRotateRight } from '@fortawesome/free-solid-svg-icons/faArrowRotateRight'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons/faTrashCan'
import { faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons/faScrewdriverWrench'
import { faBolt } from '@fortawesome/free-solid-svg-icons/faBolt'
import { faPerson } from '@fortawesome/free-solid-svg-icons/faPerson'
import { faPencil } from '@fortawesome/free-solid-svg-icons/faPencil'
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock'
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook'
import { faCopy, faCircleQuestion } from '@fortawesome/free-regular-svg-icons'
import {
  faDiscord,
  faFacebookSquare,
  faGithub,
  faInstagram,
  faMastodon,
  faTwitter
} from '@fortawesome/free-brands-svg-icons'

// FontAwesome documentation recommends adding icons to a "library" object
// which the <FontAwesomeIcon> component looks up icons from via a string id.
//
// This approach has a few issues: one, the library must be initialized before
// any React code is mounted. While that would only be a mild inconvenience
// for the app, this means any test code that mounts <FontAwesomeIcon> as children
// must also initialize the library.
//
// Secondly, the string id is arbitrary, and doesn't match the variable names
// imported here. That means it's harder to do a search through the codebase to
// see if any code is still using a particular icon.
//
// FontAwesome does work this way, which is more what one might expect. Export
// constants representing the imported FontAwesome icon; then, pass these
// constants directly into the <FontAwesomeIcon> `icon=` prop.
//
// Furthermore, this is easier to mock for any tests where <FontAwesomeIcon>
// is a child of the component under test.
export const ICON_COPY = faCopy
export const ICON_UNDO = faArrowRotateLeft
export const ICON_REDO = faArrowRotateRight
export const ICON_TOOLS = faScrewdriverWrench
export const ICON_TRASH = faTrashCan
export const ICON_MINUS = faMinus
export const ICON_PLUS = faPlus
export const ICON_CHECK = faCheck
export const ICON_ARROW_RIGHT = faArrowRight
export const ICON_ARROW_LEFT = faArrowLeft
export const ICON_CHEVRON_RIGHT = faChevronRight
export const ICON_CHEVRON_LEFT = faChevronLeft
export const ICON_BOLT = faBolt
export const ICON_PERSON = faPerson
export const ICON_PENCIL = faPencil
export const ICON_LOCK = faLock
export const ICON_BOOK = faBook
export const ICON_QUESTION_CIRCLE = faCircleQuestion

// Social icons
export const ICON_DISCORD = faDiscord
export const ICON_FACEBOOK = faFacebookSquare
export const ICON_GITHUB = faGithub
export const ICON_INSTAGRAM = faInstagram
export const ICON_MASTODON = faMastodon
export const ICON_TWITTER = faTwitter
