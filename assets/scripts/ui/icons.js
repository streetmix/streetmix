/**
 * Imports FontAwesome icons
 */
import {
  faCheck,
  faMinus,
  faPlus,
  faChevronRight,
  faChevronLeft,
  faArrowRight,
  faArrowLeft,
  faUndo,
  faRedo,
  faTrashAlt,
  faTools,
  faCrown,
  faMale,
  faPencilAlt,
  faLock
} from '@fortawesome/free-solid-svg-icons'
import { faCopy, faQuestionCircle } from '@fortawesome/free-regular-svg-icons'
import {
  faTwitter,
  faFacebookSquare,
  faGithub,
  faDiscord
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
export const ICON_UNDO = faUndo
export const ICON_REDO = faRedo
export const ICON_TOOLS = faTools
export const ICON_TRASH = faTrashAlt
export const ICON_MINUS = faMinus
export const ICON_PLUS = faPlus
export const ICON_CHECK = faCheck
export const ICON_ARROW_RIGHT = faArrowRight
export const ICON_ARROW_LEFT = faArrowLeft
export const ICON_CHEVRON_RIGHT = faChevronRight
export const ICON_CHEVRON_LEFT = faChevronLeft
export const ICON_CROWN = faCrown
export const ICON_PERSON = faMale
export const ICON_PENCIL = faPencilAlt
export const ICON_LOCK = faLock
export const ICON_QUESTION_CIRCLE = faQuestionCircle

export const ICON_TWITTER = faTwitter
export const ICON_FACEBOOK = faFacebookSquare
export const ICON_GITHUB = faGithub
export const ICON_DISCORD = faDiscord
