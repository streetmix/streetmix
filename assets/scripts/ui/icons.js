// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCheck,
  faMinus,
  faPlus,
  faChevronRight,
  faChevronLeft,
  faArrowRight,
  faArrowLeft,
  faTimes,
  faUndo,
  faRedo,
  faTrashAlt,
  faTools,
  faCrown
} from '@fortawesome/free-solid-svg-icons'
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons'
import {
  faTwitter,
  faFacebookSquare,
  faGithub,
  faDiscord
} from '@fortawesome/free-brands-svg-icons'

// Alternative icon reference, which can be mocked and tested
export const ICON_UNDO = faUndo
export const ICON_REDO = faRedo
export const ICON_TOOLS = faTools
export const ICON_MINUS = faMinus
export const ICON_PLUS = faPlus
export const ICON_ARROW_RIGHT = faArrowRight
export const ICON_ARROW_LEFT = faArrowLeft
export const ICON_CROWN = faCrown

export const ICON_TWITTER = faTwitter
export const ICON_FACEBOOK = faFacebookSquare
export const ICON_GITHUB = faGithub
export const ICON_DISCORD = faDiscord

// Load Font-Awesome icons
export function initIcons () {
  library.add(
    faCheck, faMinus, faPlus,
    faChevronRight, faChevronLeft,
    faArrowRight, faArrowLeft,
    faTimes, faTimesCircle,
    faUndo, faRedo, faTrashAlt
  )
}
